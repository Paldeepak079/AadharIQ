import pandas as pd
import json
from pathlib import Path
import numpy as np

def normalize_name(name):
    """Normalize district/state names for matching"""
    if pd.isna(name):
        return ""
    return str(name).strip().upper()

def dms_to_decimal(dms_str):
    """Convert DMS (Degrees°Minutes'Seconds\") to decimal degrees"""
    if pd.isna(dms_str):
        return None
    
    dms_str = str(dms_str).strip()
    
    # If already a number, return it
    try:
        return float(dms_str)
    except ValueError:
        pass
    
    # Parse DMS format like "17°57'17.7\""
    try:
        # Remove quotes and split by degree symbol
        parts = dms_str.replace('"', '').replace("'", ' ').replace('°', ' ').split()
        
        if len(parts) >= 1:
            degrees = float(parts[0])
            minutes = float(parts[1]) if len(parts) > 1 else 0
            seconds = float(parts[2]) if len(parts) > 2 else 0
            
            decimal = degrees + (minutes / 60) + (seconds / 3600)
            return decimal
    except:
        return None
    
    return None

def is_valid_coordinate(lat, lng):
    """Check if coordinates are within India bounds"""
    lat_decimal = dms_to_decimal(lat)
    lng_decimal = dms_to_decimal(lng)
    
    if lat_decimal is None or lng_decimal is None:
        return False
    
    # India bounds: Lat 8°N to 35°N, Lng 68°E to 97°E
    return 8 <= lat_decimal <= 35 and 68 <= lng_decimal <= 97

def calculate_district_centroids():
    """Calculate district centroids from district_lat_long.csv"""
    print("=" * 60)
    print("District Centroids Processing")
    print("=" * 60)
    
    print("\nLoading district lat/long data...")
    df = pd.read_csv('../district_lat_long/district_lat_long.csv')
    
    print(f"Loaded {len(df)} records")
    
    # Filter valid coordinates
    df_valid = df[df.apply(lambda row: is_valid_coordinate(row['latitude'], row['longitude']), axis=1)]
    print(f"Valid coordinates: {len(df_valid)} ({len(df_valid)/len(df)*100:.1f}%)")
    
    # Group by state and district
    district_groups = df_valid.groupby(['statename', 'district'])
    
    district_centroids = {}
    
    for (state, district), group in district_groups:
        state_norm = normalize_name(state)
        district_norm = normalize_name(district)
        
        if not state_norm or not district_norm:
            continue
        
        # Convert DMS coordinates to decimal
        lat_decimals = [dms_to_decimal(lat) for lat in group['latitude']]
        lng_decimals = [dms_to_decimal(lng) for lng in group['longitude']]
        
        # Filter out None values
        lat_decimals = [lat for lat in lat_decimals if lat is not None]
        lng_decimals = [lng for lng in lng_decimals if lng is not None]
        
        if not lat_decimals or not lng_decimals:
            continue
        
        # Calculate centroid from decimal coordinates
        lat_mean = sum(lat_decimals) / len(lat_decimals)
        lng_mean = sum(lng_decimals) / len(lng_decimals)
        
        # Count offices
        office_count = len(group)
        
        # Store
        if state_norm not in district_centroids:
            district_centroids[state_norm] = {}
        
        district_centroids[state_norm][district_norm] = {
            'lat': round(lat_mean, 4),
            'lng': round(lng_mean, 4),
            'offices': office_count
        }
    
    print(f"\nProcessed {len(district_centroids)} states")
    total_districts = sum(len(districts) for districts in district_centroids.values())
    print(f"Total districts: {total_districts}")
    
    return district_centroids

def load_enrollment_data():
    """Load and aggregate enrollment data by district"""
    print("\nLoading enrollment data...")
    
    enrollment_dir = Path('../api_data_aadhar_enrolment/api_data_aadhar_enrolment')
    csv_files = list(enrollment_dir.glob('*.csv'))
    
    district_enrollments = {}
    
    for csv_file in csv_files:
        print(f"Processing {csv_file.name}...")
        df = pd.read_csv(csv_file)
        
        for _, row in df.iterrows():
            state = normalize_name(row.get('state', ''))
            district = normalize_name(row.get('district', ''))
            
            if not state or not district:
                continue
            
            key = f"{state}|{district}"
            
            if key not in district_enrollments:
                district_enrollments[key] = {
                    'enrollments': 0,
                    'updates': 0,
                    'child_enrollments': 0
                }
            
            # Sum age group columns for total enrollments
            age_columns = [col for col in df.columns if col.startswith('age_')]
            total_enrollments = sum([int(row[col]) if pd.notna(row[col]) else 0 for col in age_columns])
            
            # Child enrollments (0-5 age group)
            child_enrollments = int(row.get('age_0_5', 0)) if pd.notna(row.get('age_0_5')) else 0
            
            district_enrollments[key]['enrollments'] += total_enrollments
            district_enrollments[key]['child_enrollments'] += child_enrollments
            
            # Note: Updates data might not be in enrollment CSV, will default to 0
    
    print(f"Aggregated data for {len(district_enrollments)} district combinations")
    return district_enrollments

def merge_data(district_centroids, district_enrollments):
    """Merge centroids with enrollment data and calculate metrics"""
    print("\nMerging data and calculating metrics...")
    
    merged_data = {}
    districts_with_data = 0
    districts_without_data = 0
    
    for state, districts in district_centroids.items():
        merged_data[state] = {}
        
        for district, centroid in districts.items():
            key = f"{state}|{district}"
            
            # Check if we have enrollment data
            if key in district_enrollments:
                enrollment_info = district_enrollments[key]
                
                # Skip districts with no enrollment data
                if enrollment_info['enrollments'] == 0:
                    districts_without_data += 1
                    continue
                
                # Calculate enrollment density (enrollments per office)
                density = enrollment_info['enrollments'] / centroid['offices'] if centroid['offices'] > 0 else 0
                
                # Calculate anomaly score (simple heuristic: deviation from mean density)
                # Will refine this in the next step
                anomaly_score = 0  # Placeholder
                
                merged_data[state][district] = {
                    'lat': centroid['lat'],
                    'lng': centroid['lng'],
                    'offices': centroid['offices'],
                    'enrollments': enrollment_info['enrollments'],
                    'updates': enrollment_info['updates'],
                    'child_enrollments': enrollment_info['child_enrollments'],
                    'density': round(density, 2),
                    'anomaly_score': anomaly_score
                }
                
                districts_with_data += 1
            else:
                districts_without_data += 1
    
    print(f"Districts with enrollment data: {districts_with_data}")
    print(f"Districts without data (excluded): {districts_without_data}")
    
    return merged_data

def calculate_anomaly_scores(merged_data):
    """Calculate anomaly scores based on enrollment density deviation"""
    print("\nCalculating anomaly scores...")
    
    # Collect all densities
    all_densities = []
    for state_districts in merged_data.values():
        for district_data in state_districts.values():
            all_densities.append(district_data['density'])
    
    if not all_densities:
        return merged_data
    
    # Calculate mean and std
    mean_density = np.mean(all_densities)
    std_density = np.std(all_densities)
    
    print(f"Mean density: {mean_density:.2f}")
    print(f"Std deviation: {std_density:.2f}")
    
    # Calculate anomaly scores (z-score normalized to 0-1)
    for state in merged_data:
        for district in merged_data[state]:
            density = merged_data[state][district]['density']
            
            if std_density > 0:
                z_score = abs((density - mean_density) / std_density)
                # Normalize to 0-1 range (cap at 3 std devs)
                anomaly_score = min(z_score / 3, 1.0)
            else:
                anomaly_score = 0
            
            merged_data[state][district]['anomaly_score'] = round(anomaly_score, 3)
    
    return merged_data

def main():
    """Main execution"""
    # Step 1: Calculate centroids
    district_centroids = calculate_district_centroids()
    
    # Step 2: Load enrollment data
    district_enrollments = load_enrollment_data()
    
    # Step 3: Merge data
    merged_data = merge_data(district_centroids, district_enrollments)
    
    # Step 4: Calculate anomaly scores
    merged_data = calculate_anomaly_scores(merged_data)
    
    # Step 5: Save output
    output_path = Path('../aadhaariq/public/assets/district_data.json')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(merged_data, f, indent=2)
    
    print(f"\n✅ Successfully saved to {output_path}")
    print("=" * 60)
    
    # Print summary stats
    total_districts = sum(len(districts) for districts in merged_data.values())
    print(f"\nSummary:")
    print(f"  States: {len(merged_data)}")
    print(f"  Districts with data: {total_districts}")

if __name__ == "__main__":
    main()
