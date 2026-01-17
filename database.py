import os
import pandas as pd
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, text, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Configuration
# Default to SQLite if DATABASE_URL is not set
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///uidai_data.db')

# Ensure we use the correct dialect for Postgres if it starts with 'postgres://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Global Engine
engine = create_engine(DATABASE_URL)
metadata = MetaData()

# Define Tables (Reflecting schema for migration/creation)
aadhaar_data = Table(
    'aadhaar_data', metadata,
    Column('id', Integer, primary_key=True),
    Column('state', String),
    Column('district', String),
    Column('sub_district', String),
    Column('pincode', String),
    Column('gender', String),
    Column('age', Integer),
    Column('enrolment_agency', String),
    Column('registrar', String),
    Column('status', String),
    Column('date', String),
    Column('total_enrolments', Integer, default=0),
    Column('total_updates', Integer, default=0),
    Column('demo_age_5_17', Integer, default=0),
    Column('demo_age_17_', Integer, default=0),
    Column('bio_age_5_17', Integer, default=0),
    Column('bio_age_17_', Integer, default=0),
    Column('timestamp', DateTime, default=datetime.utcnow)
)

uploaded_files = Table(
    'uploaded_files', metadata,
    Column('id', Integer, primary_key=True),
    Column('filename', String, unique=True),
    Column('upload_date', DateTime, default=datetime.utcnow),
    Column('record_count', Integer)
)

def init_db():
    """Initialize the database and create tables if they don't exist."""
    try:
        metadata.create_all(engine)
        print(f"Database initialized on {engine.url}")
    except Exception as e:
        print(f"Error initializing database: {e}")

def get_engine():
    return engine

def insert_dataframe(df, filename):
    """Inserts a pandas DataFrame into the aadhaar_data table."""
    
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
    
    with engine.connect() as conn:
        # Check if file was already uploaded to avoid duplicates
        # Using SQLAlchemy Core for safer queries
        query = text("SELECT id FROM uploaded_files WHERE filename = :filename")
        result = conn.execute(query, {"filename": filename}).fetchone()
        
        if result:
            return False, "File already processed."

        try:
            # Get available columns in the table to avoid mismatch errors
            inspector = inspect(engine)
            table_cols = [c['name'] for c in inspector.get_columns('aadhaar_data')]
            
            # Filter DF to only have columns that exist in the table
            df_to_insert = df[[col for col in df.columns if col in table_cols]]
            
            # Use Pandas to insert data
            df_to_insert.to_sql('aadhaar_data', conn, if_exists='append', index=False)
            
            # Track the file
            conn.execute(
                uploaded_files.insert().values(filename=filename, record_count=len(df))
            )
            conn.commit()
            
            return True, f"Inserted {len(df_to_insert)} records."
            
        except Exception as e:
            conn.rollback() # Rollback on error
            return False, str(e)

def get_all_data():
    """Fetch all records from the database."""
    try:
        return pd.read_sql_table("aadhaar_data", engine)
    except Exception as e:
        print(f"Error fetching data: {e}")
        return pd.DataFrame() # Return empty DF on failure

def get_uploaded_filenames():
    """Fetch list of uploaded filenames."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT filename FROM uploaded_files")).fetchall()
        return [row[0] for row in result]

def get_stats():
    """Get high-level statistics from the DB."""
    stats = {}
    
    with engine.connect() as conn:
        # Total Records
        total_records = conn.execute(text("SELECT COUNT(*) FROM aadhaar_data")).scalar()
        stats['total_records'] = total_records or 0
        
        # Records by Status
        status_res = conn.execute(text("SELECT status, COUNT(*) FROM aadhaar_data GROUP BY status")).fetchall()
        stats['by_status'] = {row[0]: row[1] for row in status_res}
        
        # Top States
        top_states_res = conn.execute(text("SELECT state, SUM(total_enrolments) as total FROM aadhaar_data GROUP BY state ORDER BY total DESC LIMIT 5")).fetchall()
        stats['top_states'] = {row[0]: row[1] for row in top_states_res}

        # Demographic & Biometric Totals
        # Note: Handling potential NULL sums
        totals_res = conn.execute(text("SELECT SUM(demo_age_5_17 + demo_age_17_), SUM(bio_age_5_17 + bio_age_17_) FROM aadhaar_data")).fetchone()
        stats['total_demographic'] = totals_res[0] or 0
        stats['total_biometric'] = totals_res[1] or 0
    
    return stats

def clear_db():
    """Drops tables and re-initializes."""
    metadata.drop_all(engine)
    init_db()

if __name__ == "__main__":
    init_db()
