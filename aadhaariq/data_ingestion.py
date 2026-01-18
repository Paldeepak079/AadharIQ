import pandas as pd
import numpy as np
import os

def ingest_and_clean(file_path, key_fields_mapping):
    """
    Reads a CSV, standardizes columns, removes nulls in key fields,
    validates numeric counts, fixes dates, and drops duplicates.
    """
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return None
    
    print(f"Ingesting: {file_path}...")
    
    # Read raw CSV
    df = pd.read_csv(file_path)
    
    # 1. Standardize column names (lowercase with underscores)
    # Example: 'State Name' -> 'state_name'
    df.columns = [col.lower().strip().replace(' ', '_') for col in df.columns]
    
    # 2. Convert date fields to datetime format (YYYY-MM-DD)
    # Detect columns containing 'date'
    date_cols = [col for col in df.columns if 'date' in col]
    for col in date_cols:
        df[col] = pd.to_datetime(df[col], errors='coerce')
    
    # 3. Numeric validation (counts must be numeric and non-negative)
    # Detect columns containing 'count'
    count_cols = [col for col in df.columns if 'count' in col]
    for col in count_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        # Remove negative values and NaNs in count columns
        df = df[df[col] >= 0]
    
    # 4. Remove rows where key fields are missing or null
    # We map the requested logical keys to the standardized column names
    standardized_keys = []
    for logical_key in key_fields_mapping:
        # Match logical key to standardized column name
        # e.g., if 'state' is key, it should match 'state_name' or 'state'
        match = [c for c in df.columns if logical_key in c]
        if match:
            standardized_keys.append(match[0])
            
    df = df.dropna(subset=standardized_keys)
    
    # 5. Drop duplicate records
    df = df.drop_duplicates()
    
    print(f"Successfully cleaned {file_path}. Valid records: {len(df)}")
    return df

def main():
    # Folder structure as per requirement
    data_dir = "aadhaar_data"
    
    # Required logical key fields
    logical_keys = ['state', 'district', 'date', 'count', 'age_group']
    
    # Process each dataset
    enrolment_df = ingest_and_clean(
        f"{data_dir}/enrolment_data.csv", 
        logical_keys
    )
    
    demographic_df = ingest_and_clean(
        f"{data_dir}/demographic_update_data.csv", 
        logical_keys
    )
    
    biometric_df = ingest_and_clean(
        f"{data_dir}/biometric_update_data.csv", 
        logical_keys
    )
    
    # Output to Parquet for faster reloading and future analysis
    if enrolment_df is not None:
        enrolment_df.to_parquet(f"{data_dir}/enrolment_data_cleaned.parquet", index=False)
    if demographic_df is not None:
        demographic_df.to_parquet(f"{data_dir}/demographic_update_data_cleaned.parquet", index=False)
    if biometric_df is not None:
        biometric_df.to_parquet(f"{data_dir}/biometric_update_data_cleaned.parquet", index=False)

    print("\nData Ingestion Framework Execution Complete.")

if __name__ == "__main__":
    main()
