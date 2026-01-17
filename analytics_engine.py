import pandas as pd
import glob
import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from openai import OpenAI
import sys
import io

# Configuration
DATA_FOLDER = 'data_uploads'
GOVT_API_URL = "https://api.data.gov.in/resource/YOUR_RESOURCE_ID" 
GOVT_API_KEY = "YOUR_API_KEY_FROM_VIDEO"

# OpenAI Configuration - expects env var or user to provide
# For hackathon simplicity, we initialize client without key, it will look for env var OPENAI_API_KEY
# or we can handle it in the request.
try:
    client = OpenAI()
except:
    client = None # Handle gracefully if no key currently

app = Flask(__name__)
CORS(app)  # Enable CORS

# Global Data Storage
GLOBAL_DF = None

def load_data():
    """Loads CSV/Excel files into the global DataFrame."""
    global GLOBAL_DF
    print("Loading data files...")
    
    if not os.path.exists(DATA_FOLDER):
        os.makedirs(DATA_FOLDER)
        
    all_files = glob.glob(os.path.join(DATA_FOLDER, "*.csv")) + \
                glob.glob(os.path.join(DATA_FOLDER, "*.xlsx"))
    
    if not all_files:
        print("No data found.")
        return False

    df_list = []
    for filename in all_files:
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(filename)
            else:
                df = pd.read_excel(filename)
            df_list.append(df)
        except Exception as e:
            print(f"Error reading {filename}: {e}")

    if df_list:
        GLOBAL_DF = pd.concat(df_list, ignore_index=True)
        # Basic cleaning
        GLOBAL_DF.dropna(how='all', inplace=True)
        print(f"Data Loaded: {len(GLOBAL_DF)} records.")
        return True
    return False

# Initial Load
load_data()

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """
    Step A: Text-to-Code Processor
    1. Receives natural language question.
    2. Sends schema + question to OpenAI.
    3. Receives Python code.
    4. Executes code on GLOBAL_DF.
    5. Returns result.
    """
    global GLOBAL_DF
    if GLOBAL_DF is None:
        if not load_data():
            return jsonify({"error": "No data available to analyze."}), 400

    data = request.json
    question = data.get('question')
    # Allow passing api key in header or body if not in env
    api_key = data.get('api_key') 
    
    if not question:
        return jsonify({"error": "Question is required"}), 400
        
    # Configure Client temporarily if key provided
    local_client = client
    if api_key:
        local_client = OpenAI(api_key=api_key)
        
    if not local_client or not local_client.api_key:
         return jsonify({"error": "OpenAI API Key missing. Set OPENAI_API_KEY env var or pass 'api_key'."}), 400

    # 1. Prompt Engineering
    columns = list(GLOBAL_DF.columns)
    df_head = GLOBAL_DF.head(3).to_markdown()
    
    system_prompt = f"""
    You are a data assistant. I have a Pandas DataFrame named `df`.
    Columns: {columns}
    Sample Data:
    {df_head}
    
    When I ask a question, return ONLY valid Python Pandas code to solve it.
    - Assume `df` is already loaded.
    - Store the final result in a variable called `result`.
    - `result` should be a Dictionary if it's a single row or aggregation (e.g. {{'count': 50}}).
    - `result` should be a List of Dictionaries if it's a dataframe slice (e.g. df.head().to_dict(orient='records')).
    - If plotting is needed, return the data logic, the frontend will handle charts.
    - Do NOT return markdown formatting (like ```python). Just the code.
    - Do NOT print anything.
    """

    try:
        # 2. Call OpenAI
        print(f"Asking OpenAI: {question}")
        completion = local_client.chat.completions.create(
            model="gpt-3.5-turbo", # or gpt-4
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            temperature=0
        )
        
        generated_code = completion.choices[0].message.content.strip()
        
        # Cleanup markdown if present
        if generated_code.startswith("```"):
            generated_code = generated_code.split('\n', 1)[1]
            if generated_code.endswith("```"):
                generated_code = generated_code.rsplit('\n', 1)[0]
        
        print(f"Generated Code:\n{generated_code}")
        
        # 3. Execution (The Dangerous Part)
        local_vars = {'df': GLOBAL_DF, 'pd': pd}
        
        # Capture stdout just in case
        old_stdout = sys.stdout
        sys.stdout = mystdout = io.StringIO()
        
        try:
            exec(generated_code, {}, local_vars)
        except Exception as e:
            sys.stdout = old_stdout
            return jsonify({"error": f"Code Execution Failed: {str(e)}", "code": generated_code}), 500
        
        sys.stdout = old_stdout
        
        result = local_vars.get('result')
        
        # 4. Response Formatting
        # Make sure result is JSON serializable
        if isinstance(result, pd.DataFrame):
            result = result.to_dict(orient='records')
        elif isinstance(result, pd.Series):
            result = result.to_dict()
            
        return jsonify({
            "generated_code": generated_code,
            "result": result,
            "type": str(type(result))
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Basic Stats Endpoint"""
    global GLOBAL_DF
    if GLOBAL_DF is None:
        if not load_data():
            return jsonify({"error": "No data found."})
            
    # Simple static logic for the dashboard
    total_records = len(GLOBAL_DF)
    stats = {
        "total_records": total_records,
        "columns": list(GLOBAL_DF.columns)
    }
    
    # Try to find a state column
    state_col = next((col for col in GLOBAL_DF.columns if 'state' in col.lower()), None)
    if state_col:
        stats['by_state'] = GLOBAL_DF[state_col].value_counts().head(5).to_dict()
        
    return jsonify({"stats": stats})

@app.route('/api/live-govt-data', methods=['GET'])
def get_live_data():
    """Pass-through to Government API"""
    try:
        user_key = request.args.get('api_key', GOVT_API_KEY)
        params = {
            "api-key": user_key,
            "format": "json",
            "limit": 10
        }
        # Pass through other filters
        for k, v in request.args.items():
            if k not in ['api_key']:
               params[k] = v

        response = requests.get(GOVT_API_URL, params=params)
        return jsonify(response.json()) if response.status_code == 200 else jsonify(response.text), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("-------------------------------------------------------")
    print(" ANALYTICS ENGINE (Text-to-Code Enabled) STARTED")
    print("-------------------------------------------------------")
    app.run(debug=True, port=5000)

