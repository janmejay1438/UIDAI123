import pandas as pd
import numpy as np
import os
from datetime import datetime
from state_utils import get_official_states_only

class UidaiAnalytics:
    def __init__(self, upload_folder='data_uploads'):
        self.upload_folder = upload_folder
        self.datasets = {
            '0-5': None,
            '5-18': None,
            '18+': None,
            'Overall': None
        }
        self.master_df = None

    def load_datasets(self, df=None):
        """
        Loads data from an external DataFrame (e.g. from SQLite).
        """
        if df is not None:
            self.master_df = df
            # Case-insensitive column search
            cols = {c.lower(): c for c in self.master_df.columns}
            
            # Ensure Date column is datetime
            date_col = next((v for k, v in cols.items() if k == 'date'), None)
            if date_col:
                self.master_df[date_col] = pd.to_datetime(self.master_df[date_col], errors='coerce')
            
            # Populate age group datasets (mock logic for segmentation if no explicit group exists)
            group_col = next((v for k, v in cols.items() if k == 'age_group'), None)
            if group_col:
                for group in self.datasets.keys():
                    self.datasets[group] = self.master_df[self.master_df[group_col] == group]
            else:
                # Mock: Put everything in 'Overall'
                self.datasets['Overall'] = self.master_df
                self.datasets['18+'] = self.master_df # Default for analytics hub
            
            print(f"Data synced into Analytics Engine: {len(self.master_df)} records")
            return True
        return False

    def detect_anomalies(self, df=None):
        """
        Identifies districts/centers with enrolment spikes > 2 Standard Deviations from the mean.
        Useful for detecting Fraud or Data Entry Errors.
        """
        target_df = df if df is not None else self.master_df
        if target_df is None: return []

        anomalies = []
        
        # Case-insensitive column search
        cols = {c.lower(): c for c in target_df.columns}
        district_col = next((v for k, v in cols.items() if k == 'district'), None)
        enrolment_col = next((v for k, v in cols.items() if k in ['enrolments', 'total_enrolments']), None)
        date_col = next((v for k, v in cols.items() if k == 'date'), None)

        if district_col and enrolment_col:
            stats = target_df.groupby(district_col)[enrolment_col].agg(['mean', 'std']).reset_index()
            
            # Join back to find outliers
            merged = pd.merge(target_df, stats, on=district_col)
            merged['Z_Score'] = (merged[enrolment_col] - merged['mean']) / (merged['std'].replace(0, 1))
            
            # Filter Anomalies (Z-Score > 2.5)
            anomaly_df = merged[merged['Z_Score'] > 2.5]
            
            for _, row in anomaly_df.iterrows():
                anomalies.append({
                    "district": row[district_col],
                    "date": str(row.get(date_col, 'N/A')),
                    "enrolments": row[enrolment_col],
                    "severity": "High",
                    "reason": f"Spike of {row['Z_Score']:.2f}x standard deviation detected."
                })
        
        return anomalies

    def analyze_societal_trends(self):
        """
        Derives specific societal insights based on the problem statement.
        """
        if self.master_df is None: return {}

        insights = {
            "migration_hubs": [],
            "saturation_gaps": [],
            "demographic_shift": None
        }

        # 1. Migration Hubs (High Volume of Address Updates in 18+)
        df_18 = self.datasets.get('18+')
        if df_18 is not None:
            cols = {c.lower(): c for c in df_18.columns}
            district_col = next((v for k, v in cols.items() if k == 'district'), None)
            update_col = next((v for k, v in cols.items() if k in ['updates', 'total_updates']), None)
            
            if district_col and update_col:
                top_migration = df_18.groupby(district_col)[update_col].sum().nlargest(5).reset_index()
                insights['migration_hubs'] = top_migration.to_dict(orient='records')

        # 2. Saturation Gaps (Low Enrolment in 0-5)
        df_05 = self.datasets.get('0-5')
        if df_05 is not None:
            cols = {c.lower(): c for c in df_05.columns}
            district_col = next((v for k, v in cols.items() if k == 'district'), None)
            enrolment_col = next((v for k, v in cols.items() if k in ['enrolments', 'total_enrolments']), None)

            if district_col and enrolment_col:
                low_saturation = df_05.groupby(district_col)[enrolment_col].sum().nsmallest(5).reset_index()
                insights['saturation_gaps'] = low_saturation.to_dict(orient='records')

        return insights

    def get_state_trends(self, period='monthly'):
        """
        Aggregates enrolments by State and Time Period.
        period: 'daily', 'monthly', 'yearly'
        """
        if self.master_df is None: return {}

        # 1. Enrich with State Data (Mock Mapping for MVP - In real life, use a GIS CSV)
        state_map = {
            'Patna': 'Bihar', 'Gaya': 'Bihar', 'Muzaffarpur': 'Bihar', 'Purnia': 'Bihar',
            'Delhi_NCR': 'Delhi',
            'Mumbai': 'Maharashtra', 'Pune': 'Maharashtra',
            'Bangalore': 'Karnataka',
            'Lucknow': 'Uttar Pradesh', 'Varanasi': 'Uttar Pradesh',
            'Jaipur': 'Rajasthan'
        }
        
        # Apply Mapping (Default to 'Other' if unknown)
        df = self.master_df.copy()
        
        # NORMALIZE STATES TO OFFICIAL 29
        df = get_official_states_only(df)
        
        cols = {c.lower(): c for c in df.columns}
        district_col = next((v for k, v in cols.items() if k == 'district'), None)
        state_col = next((v for k, v in cols.items() if k == 'state'), None)
        date_col = next((v for k, v in cols.items() if k == 'date'), None)
        enrol_col = next((v for k, v in cols.items() if k in ['enrolments', 'total_enrolments']), None)
        update_col = next((v for k, v in cols.items() if k in ['updates', 'total_updates']), None)
        
        # Demographic & Biometric columns
        demo_cols = [v for k, v in cols.items() if k in ['demo_age_5_17', 'demo_age_17_', 'total_demographic']]
        bio_cols = [v for k, v in cols.items() if k in ['bio_age_5_17', 'bio_age_17_', 'total_biometric']]

        if not state_col and district_col:
            df['state'] = df[district_col].map(state_map).fillna('Other')
            state_col = 'state'
        elif not state_col:
            return []

        # 2. Time Grouping
        if not date_col or date_col not in df.columns: return []
        
        if period == 'daily':
            df['TimeKey'] = df[date_col].dt.date.astype(str)
        elif period == 'monthly':
            df['TimeKey'] = df[date_col].dt.to_period('M').astype(str)
        elif period == 'yearly':
            df['TimeKey'] = df[date_col].dt.to_period('Y').astype(str)
            
        # 3. Aggregate
        if enrol_col:
            pivot_enrol = df.pivot_table(index=state_col, columns='TimeKey', values=enrol_col, aggfunc='sum', fill_value=0)
            result_enrol = pivot_enrol.to_dict(orient='index')
        else:
            result_enrol = {}

        if update_col:
            pivot_update = df.pivot_table(index=state_col, columns='TimeKey', values=update_col, aggfunc='sum', fill_value=0)
            result_update = pivot_update.to_dict(orient='index')
        else:
            result_update = {}

        # Aggregate Demographics
        if demo_cols:
            df['temp_demo'] = df[demo_cols].sum(axis=1)
            pivot_demo = df.pivot_table(index=state_col, columns='TimeKey', values='temp_demo', aggfunc='sum', fill_value=0)
            result_demo = pivot_demo.to_dict(orient='index')
        else:
            result_demo = {}

        # Aggregate Biometrics
        if bio_cols:
            df['temp_bio'] = df[bio_cols].sum(axis=1)
            pivot_bio = df.pivot_table(index=state_col, columns='TimeKey', values='temp_bio', aggfunc='sum', fill_value=0)
            result_bio = pivot_bio.to_dict(orient='index')
        else:
            result_bio = {}
        
        # Format for Frontend (Array of Objects)
        formatted_data = []
        all_states = set(result_enrol.keys()) | set(result_update.keys())
        
        for state in all_states:
            timeline_e = result_enrol.get(state, {})
            timeline_u = result_update.get(state, {})
            timeline_d = result_demo.get(state, {})
            timeline_b = result_bio.get(state, {})
            
            total_e = sum(timeline_e.values())
            total_u = sum(timeline_u.values())
            total_d = sum(timeline_d.values())
            total_b = sum(timeline_b.values())
            
            formatted_data.append({
                "state": state,
                "total_enrolments": total_e,
                "total_updates": total_u,
                "total_demographic": total_d,
                "total_biometric": total_b,
                "timeline_enrolments": timeline_e,
                "timeline_updates": timeline_u,
                "timeline_demographic": timeline_d,
                "timeline_biometric": timeline_b
            })
            
        return formatted_data

# Quick Test
if __name__ == "__main__":
    # Create dummy data for testing the pipeline immediately
    if not os.path.exists('data_uploads'):
        os.makedirs('data_uploads')
    
    # Mock Data Creation
    mock_data = {
        'District': ['Patna', 'Gaya', 'Delhi_NCR', 'Mumbai', 'Lucknow', 'Jaipur', 'Bangalore'],
        'Enrolments': [120, 110, 600, 5000, 300, 150, 400], 
        'Updates': [40, 30, 800, 200, 50, 20, 100],
        'Date': ['2024-01-15', '2024-01-20', '2024-02-10', '2024-02-15', '2024-03-05', '2024-01-05', '2024-02-01']
    }
    pd.DataFrame(mock_data).to_csv('data_uploads/data_18_plus.csv', index=False)
    
    engine = UidaiAnalytics()
    engine.load_datasets()
    
    print("\n--- STATE TRENDS (Monthly) ---")
    print(engine.get_state_trends('monthly'))
