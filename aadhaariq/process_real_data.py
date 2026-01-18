import pandas as pd
import numpy as np
import os
import json
from pathlib import Path

class AadhaarDataProcessor:
    """Process and aggregate Aadhaar data from CSV files"""
    
    def __init__(self, base_path="."):
        self.base_path = Path(base_path)
        self.enrolment_path = self.base_path / "api_data_aadhar_enrolment" / "api_data_aadhar_enrolment"
        self.demographic_path = self.base_path / "api_data_aadhar_demographic" / "api_data_aadhar_demographic"
        self.biometric_path = self.base_path / "api_data_aadhar_biometric" / "api_data_aadhar_biometric"
        self.output_dir = self.base_path / "aadhaariq" / "data"
        
        # Create output directory if it doesn't exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # State name normalization mapping
        self.state_normalization = {
            # West Bengal variants
            "WEST BENGAL": "West Bengal",
            "WESTBENGAL": "West Bengal",
            "West  Bengal": "West Bengal",
            "West Bangal": "West Bengal",
            "West Bengli": "West Bengal",
            "west Bengal": "West Bengal",
            "Westbengal": "West Bengal",
            
            # Jammu & Kashmir variants
            "Jammu \u0026 Kashmir": "Jammu and Kashmir",
            "Jammu And Kashmir": "Jammu and Kashmir",
            
            # Odisha variants
            "ODISHA": "Odisha",
            "Orissa": "Odisha",
            "odisha": "Odisha",
            
            # Andaman & Nicobar variants
            "Andaman \u0026 Nicobar Islands": "Andaman and Nicobar Islands",
            
            # Dadra & Nagar Haveli variants
            "Dadra \u0026 Nagar Haveli": "Dadra and Nagar Haveli",
            "The Dadra And Nagar Haveli And Daman And Diu": "Dadra and Nagar Haveli and Daman and Diu",
            
            # Daman & Diu variants
            "Daman \u0026 Diu": "Daman and Diu",
            
            # Chhattisgarh variant
            "Chhatisgarh": "Chhattisgarh",
            
            # Andhra Pradesh variant
            "andhra pradesh": "Andhra Pradesh",
            
            # Tamil Nadu variant
            "Tamilnadu": "Tamil Nadu",
            
            # Uttarakhand variant
            "Uttaranchal": "Uttarakhand",
            
            # Puducherry variant
            "Pondicherry": "Puducherry",
        }
        
        # Invalid states to remove (test data, city names, etc.)
        self.invalid_states = {
            "100000",  # Test entry
            "BALANAGAR",  # City name
            "Darbhanga",  # City name  
            "Jaipur",  # City name
            "Madanapalle",  # City name
            "Nagpur",  # City name
            "Puttenahalli",  # Area name
            "Raja Annamalai Puram",  # Area name
        }
    
    def normalize_state_name(self, state_name):
        """Normalize state name to official format"""
        if pd.isna(state_name):
            return None
        
        state_name = str(state_name).strip()
        
        # Remove if invalid
        if state_name in self.invalid_states:
            return None
        
        # Apply normalization mapping
        return self.state_normalization.get(state_name, state_name)
    
    def load_csv_files(self, folder_path):
        """Load and combine all CSV files from a folder"""
        # Use recursive glob to find files in subdirectories
        csv_files = list(Path(folder_path).rglob("*.csv"))
        if not csv_files:
            print(f"Warning: No CSV files found in {folder_path}")
            return None
        
        print(f"Loading {len(csv_files)} CSV files from {folder_path}...")
        
        dfs = []
        for csv_file in csv_files:
            try:
                df = pd.read_csv(csv_file)
                dfs.append(df)
                print(f"  Loaded {csv_file.name}: {len(df)} rows")
            except Exception as e:
                print(f"  Error loading {csv_file}: {e}")
        
        if not dfs:
            return None
        
        combined_df = pd.concat(dfs, ignore_index=True)
        print(f"Combined total: {len(combined_df)} rows\n")
        return combined_df
    
    def clean_data(self, df, data_type):
        """Clean and standardize dataframe"""
        if df is None:
            return None
        
        print(f"Cleaning {data_type} data...")
        
        # Standardize column names
        df.columns = [col.lower().strip().replace(' ', '_') for col in df.columns]
        
        # Convert date fields
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y', errors='coerce')
        
        # Normalize state names BEFORE removing nulls
        if 'state' in df.columns:
            df['state'] = df['state'].apply(self.normalize_state_name)
            # Remove rows with invalid/null states
            initial_count = len(df)
            df = df.dropna(subset=['state'])
            removed = initial_count - len(df)
            if removed > 0:
                print(f"  Removed {removed} invalid state entries")
        
        # Remove rows with null dates or locations
        df = df.dropna(subset=['date', 'district'])
        
        # Remove duplicates
        df = df.drop_duplicates()
        
        print(f"  After cleaning: {len(df)} rows\n")
        return df
    
    def aggregate_state_data(self, enrol_df, demo_df, bio_df):
        """Aggregate data by state"""
        print("Aggregating state-level statistics...")
        
        state_stats = []
        
        # Get unique states
        all_states = set()
        if enrol_df is not None:
            all_states.update(enrol_df['state'].unique())
        if demo_df is not None:
            all_states.update(demo_df['state'].unique())
        if bio_df is not None:
            all_states.update(bio_df['state'].unique())
        
        for state in sorted(all_states):
            stat = {
                'state': state,
                'enrolments': 0,
                'updates': 0,
                'childEnrolments': 0, 
                'enrolment_0_5': 0,
                'enrolment_5_17': 0,
                'enrolment_18_plus': 0,
                'biometricUpdates': 0,
                'demographicUpdates': 0,
                'ruralRatio': 0,
                'urbanRatio': 0
            }
            
            # Enrolment data
            if enrol_df is not None:
                state_enrol = enrol_df[enrol_df['state'] == state]
                if not state_enrol.empty:
                    # Sum age groups
                    if 'age_0_5' in state_enrol.columns:
                        val = int(state_enrol['age_0_5'].sum())
                        stat['enrolment_0_5'] += val
                        stat['childEnrolments'] += val # Keeping legacy field for compatibility
                    if 'age_5_17' in state_enrol.columns:
                        val = int(state_enrol['age_5_17'].sum())
                        stat['enrolment_5_17'] += val
                        stat['childEnrolments'] += val
                    if 'age_18_greater' in state_enrol.columns:
                        val = int(state_enrol['age_18_greater'].sum())
                        stat['enrolment_18_plus'] += val
                    
                    stat['enrolments'] = stat['enrolment_0_5'] + stat['enrolment_5_17'] + stat['enrolment_18_plus']
            
            # Demographic updates
            if demo_df is not None:
                state_demo = demo_df[demo_df['state'] == state]
                if not state_demo.empty:
                    if 'demo_age_5_17' in state_demo.columns:
                        stat['demographicUpdates'] += int(state_demo['demo_age_5_17'].sum())
                    if 'demo_age_17_' in state_demo.columns:
                        stat['demographicUpdates'] += int(state_demo['demo_age_17_'].sum())
                    
                    stat['updates'] += stat['demographicUpdates']
            
            # Biometric updates
            if bio_df is not None:
                state_bio = bio_df[bio_df['state'] == state]
                if not state_bio.empty:
                    if 'bio_age_5_17' in state_bio.columns:
                        stat['biometricUpdates'] += int(state_bio['bio_age_5_17'].sum())
                    if 'bio_age_17_' in state_bio.columns:
                        stat['biometricUpdates'] += int(state_bio['bio_age_17_'].sum())
                    
                    stat['updates'] += stat['biometricUpdates']
            
            # Calculate rural/urban ratio (Data Not Available in source)
            stat['ruralRatio'] = None 
            stat['urbanRatio'] = None
            
            state_stats.append(stat)
        
        print(f"  Aggregated {len(state_stats)} states\n")
        return state_stats
    
    def aggregate_district_data(self, enrol_df, demo_df, bio_df):
        """Aggregate data by district"""
        print("Aggregating district-level statistics...")
        
        district_stats = []
        
        # Process enrolment data
        if enrol_df is not None:
            for (state, district), group in enrol_df.groupby(['state', 'district']):
                total_enrol = 0
                if 'age_0_5' in group.columns:
                    total_enrol += int(group['age_0_5'].sum())
                if 'age_5_17' in group.columns:
                    total_enrol += int(group['age_5_17'].sum())
                if 'age_18_greater' in group.columns:
                    total_enrol += int(group['age_18_greater'].sum())
                
                # Get coordinates (placeholder - would need real geocoding)
                lat = 20.0 + (hash(district) % 20)
                lng = 70.0 + (hash(district) % 30)
                
                district_stats.append({
                    'state': state,
                    'district': district,
                    'enrolments': total_enrol,
                    'lat': lat,
                    'lng': lng
                })
        
        print(f"  Aggregated {len(district_stats)} districts\n")
        return district_stats[:500]  # Limit to 500 for performance
    
    def generate_time_series(self, enrol_df):
        """Generate time series data for forecasting"""
        print("Generating time series data...")
        
        if enrol_df is None:
            return []
        
        # Group by date and aggregate
        time_series = enrol_df.groupby('date').agg({
            'age_0_5': 'sum',
            'age_5_17': 'sum',
            'age_18_greater': 'sum'
        }).reset_index()
        
        time_series = time_series.sort_values('date')
        time_series['total_enrolments'] = (
            time_series['age_0_5'] + 
            time_series['age_5_17'] + 
            time_series['age_18_greater']
        )
        
        # Convert to JSON-friendly format
        ts_data = []
        for _, row in time_series.iterrows():
            ts_data.append({
                'date': row['date'].strftime('%Y-%m-%d'),
                'enrolments': int(row['total_enrolments'])
            })
        
        print(f"  Generated {len(ts_data)} time points\n")
        return ts_data[-90:]  # Last 90 days
    
    def process_all(self):
        """Main processing pipeline"""
        print("="*60)
        print("AADHAAR DATA PROCESSING PIPELINE")
        print("="*60 + "\n")
        
        # Load data
        enrol_df = self.load_csv_files(self.enrolment_path)
        demo_df = self.load_csv_files(self.demographic_path)
        bio_df = self.load_csv_files(self.biometric_path)
        
        # Clean data
        enrol_df = self.clean_data(enrol_df, "enrolment")
        demo_df = self.clean_data(demo_df, "demographic")
        bio_df = self.clean_data(bio_df, "biometric")
        
        # Aggregate data
        state_data = self.aggregate_state_data(enrol_df, demo_df, bio_df)
        district_data = self.aggregate_district_data(enrol_df, demo_df, bio_df)
        time_series = self.generate_time_series(enrol_df)
        
        # Calculate summary statistics
        total_enrolments = sum(s['enrolments'] for s in state_data)
        total_updates = sum(s['updates'] for s in state_data)
        total_child = sum(s['childEnrolments'] for s in state_data)
        
        summary = {
            'totalEnrolments': total_enrolments,
            'totalUpdates': total_updates,
            'totalChildEnrolments': total_child,
            'totalBiometricUpdates': sum(s['biometricUpdates'] for s in state_data),
            'totalDemographicUpdates': sum(s['demographicUpdates'] for s in state_data),
            'totalStates': len(state_data),
            'totalDistricts': len(district_data),
            'lastUpdated': pd.Timestamp.now().isoformat()
        }
        
        # Save processed data as JSON
        output_data = {
            'summary': summary,
            'states': state_data,
            'districts': district_data,
            'timeSeries': time_series
        }
        
        output_file = self.output_dir / 'aadhaar_data.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print("="*60)
        print(f"PROCESSING COMPLETE!")
        print(f"Output saved to: {output_file}")
        print(f"Total Enrolments: {total_enrolments:,}")
        print(f"Total Updates: {total_updates:,}")
        print(f"Total Child Enrolments: {total_child:,}")
        print("="*60)
        
        return output_data

if __name__ == "__main__":
    processor = AadhaarDataProcessor()
    processor.process_all()
