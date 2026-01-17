"""
State normalization utilities for UIDAI Analytics
Maps various state name variations to official 29 states of India
"""

# Official 29 states of India (as of 2024)
OFFICIAL_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Jammu and Kashmir'  # Now a Union Territory but historically significant
]

# Mapping of variations to official names
STATE_NORMALIZATION_MAP = {
    # Odisha variations
    'orissa': 'Odisha',
    'ODISHA': 'Odisha',
    'odisha': 'Odisha',
    
    # West Bengal variations
    'west bengal': 'West Bengal',
    'West Bangal': 'West Bengal',
    'West  Bengal': 'West Bengal',
    'Westbengal': 'West Bengal',
    'WEST BENGAL': 'West Bengal',
    'WESTBENGAL': 'West Bengal',
    'West Bengli': 'West Bengal',
    'west Bengal': 'West Bengal',
    
    # Chhattisgarh variations
    'Chhatisgarh': 'Chhattisgarh',
    
    # Uttarakhand variations
    'Uttaranchal': 'Uttarakhand',
    
    # Tamil Nadu variations
    'Tamilnadu': 'Tamil Nadu',
    
    # Andhra Pradesh variations
    'andhra pradesh': 'Andhra Pradesh',
    
    # Jammu and Kashmir variations
    'Jammu & Kashmir': 'Jammu and Kashmir',
    
    # Puducherry/Pondicherry (Union Territory - will be filtered)
    'Puducherry': None,
    'Pondicherry': None,
    
    # Delhi (Union Territory - will be filtered)
    'Delhi': None,
    
    # Chandigarh (Union Territory - will be filtered)
    'Chandigarh': None,
    
    # Andaman and Nicobar (Union Territory - will be filtered)
    'Andaman and Nicobar Islands': None,
    'Andaman & Nicobar Islands': None,
    
    # Ladakh (Union Territory - will be filtered)
    'Ladakh': None,
    
    # Lakshadweep (Union Territory - will be filtered)
    'Lakshadweep': None,
    
    # Daman and Diu (Union Territory - will be filtered)
    'Daman and Diu': None,
    'Daman & Diu': None,
    'Dadra and Nagar Haveli and Daman and Diu': None,
    'Dadra and Nagar Haveli': None,
    'Dadra & Nagar Haveli': None,
    
    # Districts/Cities (will be filtered)
    'Darbhanga': None,
    'Jaipur': None,
    'Madanapalle': None,
    'Puttenahalli': None,
    'Nagpur': None,
    'Raja Annamalai Puram': None,
    'BALANAGAR': None,
    '100000': None,
}

def normalize_state_name(state_name):
    """
    Normalize state name to official format
    Returns None if it's a Union Territory or invalid entry
    """
    if not state_name or not isinstance(state_name, str):
        return None
    
    # Check if already in official list
    if state_name in OFFICIAL_STATES:
        return state_name
    
    # Check normalization map
    if state_name in STATE_NORMALIZATION_MAP:
        return STATE_NORMALIZATION_MAP[state_name]
    
    # If not found, return None (will be filtered out)
    return None

def get_official_states_only(df):
    """
    Filter dataframe to only include official 29 states
    """
    df = df.copy()
    df['normalized_state'] = df['state'].apply(normalize_state_name)
    # Filter out None values (UTs and invalid entries)
    df = df[df['normalized_state'].notna()]
    # Replace original state column
    df['state'] = df['normalized_state']
    df = df.drop(columns=['normalized_state'])
    return df
