import os
import glob
import pandas as pd
import database

def bulk_load():
    database.init_db()
    data_folder = 'data_uploads'
    files = glob.glob(os.path.join(data_folder, "*.csv")) + glob.glob(os.path.join(data_folder, "*.xlsx"))
    
    for f in files:
        filename = os.path.basename(f)
        print(f"Loading {filename}...")
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(f)
            else:
                df = pd.read_excel(f)
            
            # Basic enrichment if columns are missing
            cols = [c.lower() for c in df.columns]
            if 'total_enrolments' not in cols and 'enrolments' not in cols:
                 df['total_enrolments'] = 0
            if 'total_updates' not in cols and 'updates' not in cols:
                 df['total_updates'] = 0
            
            success, msg = database.insert_dataframe(df, filename)
            print(f"Result: {success}, {msg}")
        except Exception as e:
            print(f"Error loading {filename}: {e}")

if __name__ == "__main__":
    bulk_load()
