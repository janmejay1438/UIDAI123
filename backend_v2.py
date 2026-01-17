import pandas as pd
import glob
import os
import json
import io
import sys
import random
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import google.generativeai as genai
import requests
from analytics_pipeline import UidaiAnalytics  # New Analytics Engine

import database # New DB Module

# App Config
app = Flask(__name__)
CORS(app)

DATA_FOLDER = 'data_uploads'
ALLOWED_EXTENSIONS = {'csv', 'xlsx'}

# Global State
GLOBAL_DF = None
ANALYTICS_ENGINE = UidaiAnalytics(DATA_FOLDER) # Initialize Pipeline
CONFIG_PATH = 'config.json'

def load_config():
    # Priority 1: Environment Variables (Deployment)
    config = {
        "gemini_key": os.environ.get("GEMINI_API_KEY"),
        "govt_key": os.environ.get("GOVT_API_KEY"),
        "govt_url": os.environ.get("GOVT_API_URL", "https://api.data.gov.in/resource/YOUR_RESOURCE_ID")
    }

    # Priority 2: Config File (Local Override)
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, 'r') as f:
                file_config = json.load(f)
                # Only update if key is missing from env or user explicitly wants file override
                # Here we just merge, preferring file if needed or filling gaps? 
                # Better approach: Env vars override file (standard practice)
                for k, v in file_config.items():
                    if not config.get(k): # If env var didn't provide it
                        config[k] = v
        except:
            pass
            
    return config

def save_config(conf):
    try:
        with open(CONFIG_PATH, 'w') as f:
            json.dump(conf, f, indent=4)
    except Exception as e:
        print(f"Error saving config: {e}")

CONFIG = load_config()

if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)

# Initialize Database
database.init_db()

# --- Helpers ---

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def enrich_data(df):
    """Enrich data with mock UIDAI fields if missing"""
    # Ensure columns exist before processing
    cols = [c.lower() for c in df.columns]
    
    if 'status' not in cols:
        statuses = ['Generated', 'Rejected', 'In Process', 'Hold']
        weights = [0.7, 0.1, 0.15, 0.05]
        df['status'] = [random.choices(statuses, weights)[0] for _ in range(len(df))]
    
    if 'gender' not in cols:
        df['gender'] = [random.choice(['Male', 'Female', 'Transgender']) for _ in range(len(df))]
        
    if 'eid' not in cols:
        df['eid'] = [f"{random.randint(1000,9999)}/{random.randint(10000,99999)}/{random.randint(10000,99999)}" for _ in range(len(df))]
    
    if 'total_enrolments' not in cols:
        df['total_enrolments'] = [random.randint(1, 100) for _ in range(len(df))]
    
    if 'total_updates' not in cols:
        df['total_updates'] = [random.randint(1, 50) for _ in range(len(df))]
        
    return df

def load_data_from_db(force=False):
    """Sync GLOBAL_DF with SQLite Database (Only if explicitly needed)."""
    global GLOBAL_DF
    if GLOBAL_DF is not None and not force:
        return True
        
    print(f"Loading GLOBAL_DF from SQLite (force={force})...")
    try:
        database.init_db() # Ensure tables exist
        GLOBAL_DF = database.get_all_data()
        print(f"Loaded {len(GLOBAL_DF)} records into memory.")
        return True
    except Exception as e:
        print(f"DB Sync Error: {e}")
        return False

# Function alias for backward compatibility or replacement
def load_data():
    # We no longer load everything on every status check
    return True, [] 

# --- Routes ---

@app.route('/api/status', methods=['GET'])
def status():
    """Health check and config status (USES FAST DB QUERIES)"""
    try:
        stats = database.get_stats()
        
        # Get file list from DB
        conn = database.get_db_connection()
        files = [row['filename'] for row in conn.execute("SELECT filename FROM uploaded_files").fetchall()]
        conn.close()

        return jsonify({
            "status": "online",
            "records": stats['total_records'],
            "files_loaded": files,
            "keys_configured": {
                "gemini": bool(CONFIG.get("gemini_key")),
                "govt": bool(CONFIG.get("govt_key"))
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/config', methods=['POST'])
def update_config():
    """Update API Keys dynamically and persist to file"""
    data = request.json
    if 'gemini_key' in data:
        CONFIG['gemini_key'] = data['gemini_key']
    if 'govt_key' in data:
        CONFIG['govt_key'] = data['govt_key']
    if 'govt_url' in data:
        CONFIG['govt_url'] = data['govt_url']
    
    save_config(CONFIG)
    return jsonify({"message": "Configuration saved persistently", "config": {k: bool(v) for k, v in CONFIG.items() if 'key' in k}})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle CSV/Excel uploads and save to SQLite"""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        path = os.path.join(DATA_FOLDER, filename)
        file.save(path)
        
        # Parse and Insert into DB
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(path)
            else:
                df = pd.read_excel(path)
            
            # Enrich with defaults
            df = enrich_data(df)
            
            # Save to DB
            success, msg = database.insert_dataframe(df, filename)
            
            if success:
                load_data_from_db(force=True) # Sync with FORCE
                return jsonify({"message": f"Successfully imported {filename}", "details": msg})
            else:
                return jsonify({"error": msg}), 400
                
        except Exception as e:
            return jsonify({"error": f"Processing error: {str(e)}"}), 500
        
    return jsonify({"error": "Invalid file type. Only CSV/XLSX allowed."}), 400

@app.route('/api/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    """Returns high-level stats for the Dashboard (FAST DB LOOKUP)"""
    try:
        db_stats = database.get_stats()
        status_map = {str(k).lower(): v for k, v in db_stats['by_status'].items() if k is not None}
        
        # Add a default for None if needed, but let's keep it clean
        if None in db_stats['by_status']:
            status_map['unknown'] = db_stats['by_status'][None]
        
        stats = {
            "total_enrolments": db_stats['total_records'],
            "generated": status_map.get('generated', 0),
            "rejected": status_map.get('rejected', 0),
            "pending": status_map.get('in process', 0) + status_map.get('hold', 0),
            "total_demographic": db_stats.get('total_demographic', 0),
            "total_biometric": db_stats.get('total_biometric', 0),
            "today_trend": "+14%",
            "history": [random.randint(100, 300) for _ in range(7)] 
        }
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/check-status', methods=['POST'])
def check_status():
    """Simulates checking status by EID"""
    data = request.json
    eid = data.get('eid')
    
    if not eid:
        return jsonify({"error": "EID required"}), 400
        
    last_digit = eid[-1] if eid else '0'
    
    if last_digit in ['1', '2', '3']:
        status = "Generated"
        step = 3
    elif last_digit in ['4', '5']:
        status = "In Process"
        step = 1
    elif last_digit in ['8', '9']:
        status = "Rejected"
        step = 3 
    else:
        status = "Validation Stage"
        step = 2
        
    return jsonify({
        "eid": eid,
        "status": status,
        "step": step,
        "details": "Your enrolment is currently being processed at the Data Center." if status != "Generated" else "Aadhaar Generated successfully."
    })

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """Text-to-Code Endpoint (Gemini Powered)"""
    global GLOBAL_DF
    if GLOBAL_DF is None:
        load_data()
        
    if GLOBAL_DF is None:
        return jsonify({"error": "No data available. Please upload a CSV."}), 400

    data = request.json
    question = data.get('question')
    api_key = data.get('api_key') or CONFIG['GEMINI_API_KEY']
    
    if not api_key:
         return jsonify({"error": "Gemini API Key not configured. Go to Admin Settings."}), 400

    # Configure Gemini
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

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
    - Do NOT return markdown formatting (like ```python). Just the plain code.
    - Do NOT include print statements.
    """

    try:
        response = model.generate_content(system_prompt + "\nQuestion: " + question)
        generated_code = response.text.strip().replace('```python', '').replace('```', '')
        
        print(f"Gemini Code: {generated_code}")

        local_vars = {'df': GLOBAL_DF, 'pd': pd}
        old_stdout = sys.stdout
        sys.stdout = mystdout = io.StringIO()
        
        try:
            exec(generated_code, {}, local_vars)
        except Exception as exec_err:
             sys.stdout = old_stdout
             return jsonify({"error": f"Execution Error: {exec_err}", "code": generated_code}), 500

        sys.stdout = old_stdout
        result = local_vars.get('result')
        
        # Serialization fix
        if isinstance(result, pd.DataFrame):
            result = result.to_dict(orient='records')
        elif isinstance(result, pd.Series):
            result = result.to_dict()
            
        return jsonify({
            "code": generated_code,
            "result": result
        })
        
    except Exception as e:
        return jsonify({"error": f"Gemini/Processing Error: {str(e)}"}), 500

# --- Advanced Analytics Routes ---

@app.route('/api/analytics/advanced', methods=['GET'])
def get_advanced_analytics():
    """Exposes the Societal Trends Engine"""
    load_data_from_db()
    ANALYTICS_ENGINE.load_datasets(GLOBAL_DF)
    
    trends = ANALYTICS_ENGINE.analyze_societal_trends()
    return jsonify(trends)

@app.route('/api/analytics/anomalies', methods=['GET'])
def get_anomalies():
    """Exposes the Anomaly Detection Engine"""
    load_data_from_db()
    ANALYTICS_ENGINE.load_datasets(GLOBAL_DF)
    
    anomalies = ANALYTICS_ENGINE.detect_anomalies()
    return jsonify({
        "count": len(anomalies),
        "flags": anomalies
    })

@app.route('/api/analytics/states', methods=['GET'])
def get_state_metrics():
    """Returns State-wise enrolment trends aggregated by Day/Month/Year"""
    period = request.args.get('period', 'monthly') # daily, monthly, yearly
    load_data_from_db()
    ANALYTICS_ENGINE.load_datasets(GLOBAL_DF)
    
    data = ANALYTICS_ENGINE.get_state_trends(period)
    return jsonify(data)

# --- Main Execution ---

if __name__ == '__main__':
    # Initial Load
    load_data()
    print("-------------------------------------------------------")
    print(" ANALYTICS BACKEND V4 (FIXED) STARTED")
    print("-------------------------------------------------------")
    app.run(host='0.0.0.0', debug=True, port=5000)
