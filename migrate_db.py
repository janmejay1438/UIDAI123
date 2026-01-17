import os
import sqlite3
import pandas as pd
from sqlalchemy import create_engine, text
from database import init_db, engine as target_engine

# Path to the local SQLite database
SQLITE_DB_PATH = 'uidai_data.db'

def migrate():
    print("--- Database Migration Tool ---")
    
    # 1. Validate Source
    if not os.path.exists(SQLITE_DB_PATH):
        print(f"Error: Local SQLite file '{SQLITE_DB_PATH}' not found.")
        return

    # 2. Validate Target
    target_url = str(target_engine.url)
    if 'sqlite' in target_url:
        print("Error: Target database is configured as SQLite.")
        print("Please set DATABASE_URL in your .env file to your PostgreSQL connection string.")
        return

    print(f"Source: {SQLITE_DB_PATH} (SQLite)")
    print(f"Target: {target_url.split('@')[-1] if '@' in target_url else target_url} (PostgreSQL)")
    
    # 3. Connection to Source (SQLite)
    try:
        src_conn = sqlite3.connect(SQLITE_DB_PATH)
        print("Connected to source database.")
    except Exception as e:
        print(f"Failed to connect to source: {e}")
        return

    # 4. Initialize Target Schema
    print("Initializing target schema...")
    try:
        init_db()
    except Exception as e:
        print(f"Failed to initialize target DB: {e}")
        return

    # 5. Migrate Data
    tables = ['aadhaar_data', 'uploaded_files']
    
    for table in tables:
        print(f"\nMigrating table: {table}...")
        try:
            # Read from Source
            df = pd.read_sql_query(f"SELECT * FROM {table}", src_conn)
            
            if df.empty:
                print(f"  - Table {table} is empty. Skipping.")
                continue
                
            print(f"  - Read {len(df)} records from source.")
            
            # Write to Target
            # chunksize=1000 helps with memory and network timeouts
            df.to_sql(table, target_engine, if_exists='append', index=False, chunksize=1000)
            print(f"  - Successfully wrote {len(df)} records to target.")
            
        except Exception as e:
            print(f"  - Error migrating {table}: {e}")

    src_conn.close()
    print("\n--- Migration Complete ---")

if __name__ == "__main__":
    migrate()
