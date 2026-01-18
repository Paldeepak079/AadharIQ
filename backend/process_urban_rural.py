import pandas as pd
import json
from pathlib import Path
from datetime import datetime

def load_pincode_mapping():
    """Load pincode mapping and classify as Urban/Rural based on Office Type"""
    print("Loading pincode mapping...")
    pincode_df = pd.read_csv('../pincode mapping/pincode_mapping.csv')
    
    # Create classification: BO (Branch Office) = Rural, SO/HO = Urban
    # Also store state information
    pincode_info = {}
    
    for _, row in pincode_df.iterrows():
        pincode = str(row['pincode']).strip()
        office_type = str(row['officetype']).strip().upper()
        state = str(row['statename']).strip()
        
        # BO = Branch Office = Rural
        # SO = Sub Office, HO = Head Office = Urban
        classification = None
        if office_type == 'BO':
            classification = 'Rural'
        elif office_type in ['SO', 'HO']:
            classification = 'Urban'
        
        if classification:
            pincode_info[pincode] = {
                'classification': classification,
                'state': state
            }
    
    print(f"Loaded {len(pincode_info)} pincode classifications")
    urban_count = sum(1 for v in pincode_info.values() if v['classification'] == 'Urban')
    rural_count = sum(1 for v in pincode_info.values() if v['classification'] == 'Rural')
    print(f"Urban pincodes: {urban_count}, Rural pincodes: {rural_count}")
    
    return pincode_info

def process_enrollment_data(pincode_info):
    """Process enrollment data and aggregate by Urban/Rural for All India and by State"""
    print("\nProcessing enrollment data...")
    
    # Find all enrollment CSV files
    enrollment_dir = Path('../api_data_aadhar_enrolment/api_data_aadhar_enrolment')
    csv_files = list(enrollment_dir.glob('*.csv'))
    
    # Storage for All India aggregated data
    all_india_data = {
        'Urban': {},
        'Rural': {}
    }
    
    # Storage for state-wise data
    state_data = {}
    
    total_processed = 0
    classified_count = 0
    
    for csv_file in csv_files:
        print(f"Processing {csv_file.name}...")
        df = pd.read_csv(csv_file)
        
        for _, row in df.iterrows():
            total_processed += 1
            
            # Extract data
            date = str(row['date']).strip()
            pincode = str(row['pincode']).strip()
            
            # Sum all age group columns for total enrollments
            age_columns = [col for col in df.columns if col.startswith('age_')]
            total_enrollments = sum([int(row[col]) if pd.notna(row[col]) else 0 for col in age_columns])
            
            # Get pincode info
            if pincode not in pincode_info:
                continue
            
            classification = pincode_info[pincode]['classification']
            state = pincode_info[pincode]['state']
            
            classified_count += 1
            
            # Aggregate for All India
            if date not in all_india_data[classification]:
                all_india_data[classification][date] = 0
            all_india_data[classification][date] += total_enrollments
            
            # Aggregate by state
            if state not in state_data:
                state_data[state] = {
                    'Urban': {},
                    'Rural': {}
                }
            
            if date not in state_data[state][classification]:
                state_data[state][classification][date] = 0
            state_data[state][classification][date] += total_enrollments
    
    print(f"\nTotal records processed: {total_processed}")
    print(f"Successfully classified: {classified_count} ({classified_count/total_processed*100:.2f}%)")
    print(f"States covered: {len(state_data)}")
    
    return all_india_data, state_data

def format_velocity_data(velocity_data):
    """Convert velocity data to frontend format"""
    urban_series = sorted([(date, count) for date, count in velocity_data['Urban'].items()])
    rural_series = sorted([(date, count) for date, count in velocity_data['Rural'].items()])
    
    return {
        'urban': [{'date': date, 'enrollments': count} for date, count in urban_series],
        'rural': [{'date': date, 'enrollments': count} for date, count in rural_series],
        'summary': {
            'totalUrban': sum([count for _, count in urban_series]),
            'totalRural': sum([count for _, count in rural_series]),
            'urbanDataPoints': len(urban_series),
            'ruralDataPoints': len(rural_series),
            'dateRange': {
                'start': urban_series[0][0] if urban_series else None,
                'end': urban_series[-1][0] if urban_series else None
            }
        }
    }

def main():
    """Main execution"""
    print("=" * 60)
    print("Urban vs Rural Velocity Data Processing")
    print("=" * 60)
    
    # Load pincode classification
    pincode_info = load_pincode_mapping()
    
    # Process enrollment data
    all_india_data, state_data = process_enrollment_data(pincode_info)
    
    # Format All India data
    print("\nCalculating All India metrics...")
    all_india_output = format_velocity_data(all_india_data)
    
    print(f"Urban total enrollments: {all_india_output['summary']['totalUrban']:,}")
    print(f"Rural total enrollments: {all_india_output['summary']['totalRural']:,}")
    
    # Format state-wise data
    print("\nCalculating state-wise metrics...")
    states_output = {}
    for state, state_velocity in state_data.items():
        states_output[state] = format_velocity_data(state_velocity)
    
    # Create combined output
    combined_output = {
        'allIndia': all_india_output,
        'states': states_output,
        'stateList': sorted(list(states_output.keys()))
    }
    
    # Save to file
    output_path = Path('../aadhaariq/public/assets/urban_rural_velocity.json')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(combined_output, f, indent=2)
    
    print(f"\n✅ Successfully saved to {output_path}")
    print(f"   - All India data included")
    print(f"   - {len(states_output)} states included")
    print("=" * 60)

if __name__ == "__main__":
    main()
