import sqlite3
import pandas as pd
import os

DB_PATH = 'uidai_data.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database and create tables if they don't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Main table for Aadhaar Data
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS aadhaar_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            state TEXT,
            district TEXT,
            sub_district TEXT,
            pincode TEXT,
            gender TEXT,
            age INTEGER,
            enrolment_agency TEXT,
            registrar TEXT,
            status TEXT,
            date TEXT,
            total_enrolments INTEGER DEFAULT 0,
            total_updates INTEGER DEFAULT 0,
            demo_age_5_17 INTEGER DEFAULT 0,
            demo_age_17_ INTEGER DEFAULT 0,
            bio_age_5_17 INTEGER DEFAULT 0,
            bio_age_17_ INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Table to track uploaded files
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS uploaded_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT UNIQUE,
            upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            record_count INTEGER
        )
    ''')
    
    conn.commit()
    conn.close()

def insert_dataframe(df, filename):
    """Inserts a pandas DataFrame into the aadhaar_data table."""
    conn = get_db_connection()
    
    # Standardize column names (lowercase and underscores)
    df.columns = [col.lower().replace(' ', '_') for col in df.columns]
    
    # --- SMART MAPPING ---
    # Sum up demographic counts if total_updates is missing or zero
    demo_cols = [c for c in df.columns if 'demo_age' in c]
    if demo_cols:
        if 'total_updates' not in df.columns:
            df['total_updates'] = df[demo_cols].sum(axis=1)
        else:
            df['total_updates'] = df['total_updates'].fillna(0) + df[demo_cols].sum(axis=1)

    # Sum up biometric counts if total_enrolments is missing or zero
    bio_cols = [c for c in df.columns if 'bio_age' in c]
    if bio_cols:
        if 'total_enrolments' not in df.columns:
            df['total_enrolments'] = df[bio_cols].sum(axis=1)
        else:
            df['total_enrolments'] = df['total_enrolments'].fillna(0) + df[bio_cols].sum(axis=1)
    
    # Check if file was already uploaded to avoid duplicates
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM uploaded_files WHERE filename = ?", (filename,))
    if cursor.fetchone():
        conn.close()
        return False, "File already processed."

    try:
        # Get table columns
        cursor.execute("PRAGMA table_info(aadhaar_data)")
        table_cols = [row[1] for row in cursor.fetchall()]
        
        # Filter DF to only have columns that exist in the table
        df_to_insert = df[[col for col in df.columns if col in table_cols]]
        
        # We use 'append' so multiple uploads accumulate
        df_to_insert.to_sql('aadhaar_data', conn, if_exists='append', index=False)
        
        # Track the file
        cursor.execute("INSERT INTO uploaded_files (filename, record_count) VALUES (?, ?)", 
                       (filename, len(df)))
        
        conn.commit()
        conn.close()
        return True, f"Inserted {len(df_to_insert)} records."
    except Exception as e:
        conn.close()
        return False, str(e)

def get_all_data():
    """Fetch all records from the database."""
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT * FROM aadhaar_data", conn)
    conn.close()
    return df

def get_stats():
    """Get high-level statistics from the DB."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    stats = {}
    
    # Total Records
    cursor.execute("SELECT COUNT(*) FROM aadhaar_data")
    stats['total_records'] = cursor.fetchone()[0]
    
    # Records by Status
    cursor.execute("SELECT status, COUNT(*) FROM aadhaar_data GROUP BY status")
    stats['by_status'] = {row[0]: row[1] for row in cursor.fetchall()}
    
    # Top States
    cursor.execute("SELECT state, SUM(total_enrolments) as total FROM aadhaar_data GROUP BY state ORDER BY total DESC LIMIT 5")
    stats['top_states'] = {row[0]: row[1] for row in cursor.fetchall()}

    # Demographic & Biometric Totals
    cursor.execute("SELECT SUM(demo_age_5_17 + demo_age_17_), SUM(bio_age_5_17 + bio_age_17_) FROM aadhaar_data")
    row = cursor.fetchone()
    stats['total_demographic'] = row[0] or 0
    stats['total_biometric'] = row[1] or 0
    
    conn.close()
    return stats

def clear_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    init_db()

if __name__ == "__main__":
    init_db()
    print("Database initialized.")
