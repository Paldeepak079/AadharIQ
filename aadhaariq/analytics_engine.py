import pandas as pd
import numpy as np
import json
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict

class AadhaarAnalyticsEngine:
    """
    Advanced AI Analytics Engine for AadhaarIQ
    Analyzes nationwide Aadhaar data to identify patterns, trends, and generate policy recommendations
    """
    
    def __init__(self, data_path="data/aadhaar_data.json"):
        self.data_path = Path(data_path)
        self.load_data()
        
    def load_data(self):
        """Load processed Aadhaar data"""
        with open(self.data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        self.summary = data['summary']
        self.states = pd.DataFrame(data['states'])
        self.districts = pd.DataFrame(data['districts'])
        self.time_series = pd.DataFrame(data['timeSeries'])
        
        # Convert date column
        self.time_series['date'] = pd.to_datetime(self.time_series['date'])
        
        print(f"✓ Loaded data: {len(self.states)} states, {len(self.districts)} districts")
    
    def compute_saturation_levels(self):
        """Compute Aadhaar saturation by age groups"""
        print("\n" + "="*80)
        print("SATURATION ANALYSIS BY AGE GROUP")
        print("="*80)
        
        total_enrolments = self.summary['totalEnrolments']
        child_enrolments = self.summary['totalChildEnrolments']  # 0-17 years
        
        # Estimate population (rough approximation)
        # India population ~1.4B, 0-17 years ~30%, 18+ ~70%
        estimated_child_pop = 420_000_000  # 30% of 1.4B
        estimated_adult_pop = 980_000_000  # 70% of 1.4B
        
        # Calculate saturation
        child_saturation = (child_enrolments / estimated_child_pop) * 100
        adult_saturation = ((total_enrolments - child_enrolments) / estimated_adult_pop) * 100
        
        saturation_report = {
            "children_0_17": {
                "enrolled": child_enrolments,
                "estimated_population": estimated_child_pop,
                "saturation_percent": round(child_saturation, 2),
                "status": "CRITICAL" if child_saturation < 50 else "MODERATE" if child_saturation < 80 else "GOOD"
            },
            "adults_18_plus": {
                "enrolled": total_enrolments - child_enrolments,
                "estimated_population": estimated_adult_pop,
                "saturation_percent": round(adult_saturation, 2),
                "status": "CRITICAL" if adult_saturation < 50 else "MODERATE" if adult_saturation < 95 else "EXCELLENT"
            }
        }
        
        print(f"\n📊 Children (0-17 years)")
        print(f"   Enrolled: {child_enrolments:,}")
        print(f"   Saturation: {child_saturation:.2f}%")
        print(f"   Status: {saturation_report['children_0_17']['status']}")
        
        print(f"\n📊 Adults (18+ years)")
        print(f"   Enrolled: {total_enrolments - child_enrolments:,}")
        print(f"   Saturation: {adult_saturation:.2f}%")
        print(f"   Status: {saturation_report['adults_18_plus']['status']}")
        
        return saturation_report
    
    def detect_anomalies(self):
        """Detect anomalies and unusual patterns"""
        print("\n" + "="*80)
        print("ANOMALY DETECTION")
        print("="*80)
        
        # Calculate update-to-enrolment ratio for each state
        self.states['update_ratio'] = self.states['updates'] / (self.states['enrolments'] + 1)
        
        # Statistical anomaly detection (Z-score method)
        mean_ratio = self.states['update_ratio'].mean()
        std_ratio = self.states['update_ratio'].std()
        self.states['z_score'] = (self.states['update_ratio'] - mean_ratio) / std_ratio
        
        # Identify anomalies (|z-score| > 2)
        anomalies = self.states[abs(self.states['z_score']) > 2].sort_values('update_ratio', ascending=False)
        
        print(f"\n🚨 Detected {len(anomalies)} anomalous states/UTs")
        print(f"   Mean update ratio: {mean_ratio:.2f}")
        print(f"   Std deviation: {std_ratio:.2f}")
        
        anomaly_list = []
        for idx, row in anomalies.head(10).iterrows():
            anomaly_type = "HIGH_UPDATE_VELOCITY" if row['z_score'] > 0 else "LOW_UPDATE_VELOCITY"
            severity = "CRITICAL" if abs(row['z_score']) > 3 else "HIGH"
            
            anomaly_list.append({
                "state": row['state'],
                "type": anomaly_type,
                "severity": severity,
                "update_ratio": round(row['update_ratio'], 2),
                "z_score": round(row['z_score'], 2),
                "enrolments": int(row['enrolments']),
                "updates": int(row['updates'])
            })
            
            print(f"\n   {severity}: {row['state']}")
            print(f"      Update ratio: {row['update_ratio']:.2f} (Z-score: {row['z_score']:.2f})")
            print(f"      Enrolments: {row['enrolments']:,} | Updates: {row['updates']:,}")
        
        return anomaly_list
    
    def analyze_rural_urban_variance(self):
        """Analyze rural-urban distribution variances"""
        print("\n" + "="*80)
        print("RURAL-URBAN VARIANCE ANALYSIS")
        print("="*80)
        
        # Calculate weighted rural/urban ratios
        total_rural = (self.states['ruralRatio'] * self.states['enrolments']).sum() / self.states['enrolments'].sum()
        total_urban = 100 - total_rural
        
        # Identify states with significant variance
        high_rural = self.states[self.states['ruralRatio'] > 75].sort_values('enrolments', ascending=False)
        high_urban = self.states[self.states['urbanRatio'] > 50].sort_values('enrolments', ascending=False)
        
        print(f"\n📍 National Average:")
        print(f"   Rural: {total_rural:.1f}% | Urban: {total_urban:.1f}%")
        
        print(f"\n🌾 High Rural States (>75%):")
        for idx, row in high_rural.head(5).iterrows():
            print(f"   {row['state']}: {row['ruralRatio']}% rural ({row['enrolments']:,} enrolments)")
        
        print(f"\n🏙️  High Urban States (>50%):")
        for idx, row in high_urban.head(5).iterrows():
            print(f"   {row['state']}: {row['urbanRatio']}% urban ({row['enrolments']:,} enrolments)")
        
        return {
            "national_rural_percent": round(total_rural, 2),
            "national_urban_percent": round(total_urban, 2),
            "high_rural_states": high_rural.head(5)['state'].tolist(),
            "high_urban_states": high_urban.head(5)['state'].tolist()
        }
    
    def forecast_future_trends(self):
        """Simple forecasting using linear regression (Prophet alternative)"""
        print("\n" + "="*80)
        print("FUTURE TREND FORECASTING")
        print("="*80)
        
        if len(self.time_series) < 10:
            print("\nInsufficient time series data for accurate forecasting")
            return None
        
        # Calculate daily growth rate
        self.time_series = self.time_series.sort_values('date')
        self.time_series['days_elapsed'] = (self.time_series['date'] - self.time_series['date'].min()).dt.days
        
        # Linear regression for trend
        X = self.time_series['days_elapsed'].values
        y = self.time_series['enrolments'].values
        
        # Calculate slope (daily growth rate)
        slope = np.polyfit(X, y, 1)[0]
        intercept = np.polyfit(X, y, 1)[1]
        
        # Forecast next 30 days
        last_day = X[-1]
        forecast_days = range(last_day + 1, last_day + 31)
        forecasted_values = [slope * day + intercept for day in forecast_days]
        
        avg_current = np.mean(y[-7:])  # Last 7 days average
        avg_forecast = np.mean(forecasted_values)
        growth_percent = ((avg_forecast - avg_current) / avg_current) * 100
        
        print(f"\n📈 Forecast Summary:")
        print(f"   Daily growth rate: {slope:,.0f} enrolments/day")
        print(f"   Current 7-day avg: {avg_current:,.0f}")
        print(f"   30-day forecast avg: {avg_forecast:,.0f}")
        print(f"   Projected growth: {growth_percent:+.2f}%")
        
        return {
            "daily_growth_rate": int(slope),
            "current_average": int(avg_current),
            "forecast_average": int(avg_forecast),
            "growth_percent": round(growth_percent, 2)
        }
    
    def cluster_districts(self):
        """Cluster districts by demographic characteristics"""
        print("\n" + "="*80)
        print("DISTRICT CLUSTERING ANALYSIS")
        print("="*80)
        
        # Simple clustering based on enrolment volume
        self.districts['cluster'] = pd.qcut(
            self.districts['enrolments'], 
            q=4, 
            labels=['Low_Activity', 'Moderate_Activity', 'High_Activity', 'Critical_Hubs']
        )
        
        cluster_stats = self.districts.groupby('cluster').agg({
            'enrolments': ['count', 'sum', 'mean']
        })
        
        print(f"\n🗂️  District Clusters:")
        for cluster in ['Low_Activity', 'Moderate_Activity', 'High_Activity', 'Critical_Hubs']:
            count = len(self.districts[self.districts['cluster'] == cluster])
            total = self.districts[self.districts['cluster'] == cluster]['enrolments'].sum()
            print(f"   {cluster}: {count} districts, {total:,} total enrolments")
        
        # Identify critical hubs
        critical_hubs = self.districts[self.districts['cluster'] == 'Critical_Hubs'].sort_values('enrolments', ascending=False)
        
        print(f"\n🎯 Top Critical Hubs:")
        for idx, row in critical_hubs.head(10).iterrows():
            print(f"   {row['district']}, {row['state']}: {row['enrolments']:,} enrolments")
        
        return {
            "cluster_distribution": self.districts['cluster'].value_counts().to_dict(),
            "critical_hubs": critical_hubs.head(10).to_dict('records')
        }
    
    def generate_state_recommendations(self):
        """Generate state-specific strategic recommendations"""
        print("\n" + "="*80)
        print("STATE-SPECIFIC STRATEGIC RECOMMENDATIONS")
        print("="*80)
        
        recommendations = []
        
        # Top 10 states by enrolment
        top_states = self.states.nlargest(10, 'enrolments')
        
        for idx, state in top_states.iterrows():
            rec = {
                "state": state['state'],
                "current_enrolments": int(state['enrolments']),
                "current_updates": int(state['updates']),
                "child_enrolments": int(state['childEnrolments']),
                "update_ratio": round(state['update_ratio'], 2),
                "recommendations": []
            }
            
            # Generate context-specific recommendations
            if state['update_ratio'] > 20:
                rec['recommendations'].append({
                    "priority": "HIGH",
                    "category": "Update Capacity",
                    "action": f"Deploy additional biometric update centers to handle {state['updates']:,} pending updates"
                })
            
            if state['ruralRatio'] > 70:
                rec['recommendations'].append({
                    "priority": "MEDIUM",
                    "category": "Rural Outreach",
                    "action": f"Strengthen mobile enrolment units in rural areas ({state['ruralRatio']}% rural population)"
                })
            
            if state['childEnrolments'] / state['enrolments'] > 0.9:
                rec['recommendations'].append({
                    "priority": "HIGH",
                    "category": "Child Saturation",
                    "action": "Focus on school-based enrollment drives for 0-5 age group"
                })
            else:
                rec['recommendations'].append({
                    "priority": "MEDIUM",
                    "category": "Adult Coverage",
                    "action": "Expand adult enrollment through employer partnerships and community centers"
                })
            
            recommendations.append(rec)
            
            print(f"\n📍 {state['state']}")
            print(f"   Enrolments: {state['enrolments']:,} | Updates: {state['updates']:,}")
            for r in rec['recommendations']:
                print(f"   [{r['priority']}] {r['category']}: {r['action']}")
        
        return recommendations
    
    def generate_comprehensive_report(self):
        """Generate final comprehensive analytics report"""
        print("\n" + "="*80)
        print("GENERATING COMPREHENSIVE ANALYTICS REPORT")
        print("="*80)
        
        report = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "data_summary": self.summary,
                "report_type": "National Aadhaar Analytics Report"
            },
            "saturation_analysis": self.compute_saturation_levels(),
            "anomaly_detection": self.detect_anomalies(),
            "rural_urban_analysis": self.analyze_rural_urban_variance(),
            "forecasting": self.forecast_future_trends(),
            "clustering": self.cluster_districts(),
            "state_recommendations": self.generate_state_recommendations()
        }
        
        # Save report
        output_path = Path("data/analytics_report.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Report saved to: {output_path}")
        
        return report

if __name__ == "__main__":
    print("\n" + "="*80)
    print("AADHAARIQ AI ANALYTICS ENGINE")
    print("Powered by Advanced Statistical Models & Machine Learning")
    print("="*80)
    
    engine = AadhaarAnalyticsEngine()
    report = engine.generate_comprehensive_report()
    
    print("\n" + "="*80)
    print("ANALYTICS ENGINE EXECUTION COMPLETE")
    print("="*80)
