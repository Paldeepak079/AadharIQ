import pandas as pd
import json
from pathlib import Path

def dms_to_decimal(dms_str):
    """Convert DMS to decimal degrees"""
    if pd.isna(dms_str):
        return None
    
    dms_str = str(dms_str).strip()
    
    try:
        return float(dms_str)
    except ValueError:
        pass
    
    try:
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

def calculate_state_centroids():
    """Calculate accurate state centroids from district_lat_long.csv"""
    print("=" * 60)
    print("Calculating Accurate State Centroids")
    print("=" * 60)
    
    print("\nLoading district lat/long data...")
    df = pd.read_csv('../district_lat_long/district_lat_long.csv')
    
    print(f"Loaded {len(df)} records")
    
    # Convert coordinates
    df['lat_decimal'] = df['latitude'].apply(dms_to_decimal)
    df['lng_decimal'] = df['longitude'].apply(dms_to_decimal)
    
    # Filter valid coordinates within India bounds
    df_valid = df[
        (df['lat_decimal'].notna()) &
        (df['lng_decimal'].notna()) &
        (df['lat_decimal'] >= 8) & (df['lat_decimal'] <= 35) &
        (df['lng_decimal'] >= 68) & (df['lng_decimal'] <= 97)
    ]
    
    print(f"Valid coordinates: {len(df_valid)}")
    
    # Calculate state centroids
    state_centroids = {}
    
    for state in df_valid['statename'].unique():
        if pd.isna(state):
            continue
        
        state_norm = str(state).strip().upper()
        state_data = df_valid[df_valid['statename'] == state]
        
        lat_mean = state_data['lat_decimal'].mean()
        lng_mean = state_data['lng_decimal'].mean()
        
        # Calculate bounds for zoom
        lat_min = state_data['lat_decimal'].min()
        lat_max = state_data['lat_decimal'].max()
        lng_min = state_data['lng_decimal'].min()
        lng_max = state_data['lng_decimal'].max()
        
        # Calculate appropriate zoom scale based on state size
        lat_range = lat_max - lat_min
        lng_range = lng_max - lng_min
        max_range = max(lat_range, lng_range)
        
        # Scale calculation: smaller states need higher zoom
        if max_range < 1:
            zoom_scale = 25
        elif max_range < 2:
            zoom_scale = 18
        elif max_range < 4:
            zoom_scale = 12
        elif max_range < 6:
            zoom_scale = 9
        else:
            zoom_scale = 6
        
        state_centroids[state_norm] = {
            'lat': round(lat_mean, 4),
            'lng': round(lng_mean, 4),
            'bounds': {
                'latMin': round(lat_min, 4),
                'latMax': round(lat_max, 4),
                'lngMin': round(lng_min, 4),
                'lngMax': round(lng_max, 4)
            },
            'zoomScale': zoom_scale
        }
    
    print(f"\nCalculated centroids for {len(state_centroids)} states")
    
    # Save to file
    output_path = Path('../aadhaariq/public/assets/state_centroids.json')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(state_centroids, f, indent=2)
    
    print(f"\n✅ Successfully saved to {output_path}")
    
    # Print sample
    print("\nSample state centroids:")
    for state in list(state_centroids.keys())[:5]:
        print(f"  {state}: lat={state_centroids[state]['lat']}, lng={state_centroids[state]['lng']}, zoom={state_centroids[state]['zoomScale']}")
    
    print("=" * 60)

if __name__ == "__main__":
    calculate_state_centroids()
