from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
from pathlib import Path
import uvicorn

app = FastAPI(
    title="AadhaarIQ API",
    description="Real-time AI/ML-powered analytics API for Aadhaar enrolment and update trends",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000", "http://localhost:5173", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data
DATA_PATH = Path(__file__).parent.parent / "aadhaariq" / "data" / "aadhaar_data.json"
ANALYTICS_PATH = Path(__file__).parent.parent / "aadhaariq" / "data" / "analytics_report.json"

def load_data():
    """Load processed data"""
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Data file not found at {DATA_PATH}")
        return {"states": [], "districts": [], "summary": {}, "timeSeries": []}

def load_analytics():
    """Load analytics report"""
    try:
        with open(ANALYTICS_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return None

# Global data cache
data_cache = load_data()
analytics_cache = load_analytics()

# Pydantic models
class DashboardStats(BaseModel):
    totalEnrolments: int
    totalUpdates: int
    totalChildEnrolments: int
    totalBiometricUpdates: int
    totalDemographicUpdates: int
    totalStates: int
    totalDistricts: int
    lastUpdated: str

class StateData(BaseModel):
    state: str
    enrolments: int
    updates: int
    childEnrolments: int
    biometricUpdates: int
    demographicUpdates: int
    ruralRatio: float
    urbanRatio: float

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "AadhaarIQ API v1.0",
        "endpoints": {
            "dashboard": "/api/dashboard/stats",
            "states": "/api/states",
            "state_detail": "/api/states/{state_name}",
            "districts": "/api/districts",
            "anomalies": "/api/ml/anomalies",
            "forecast": "/api/ml/forecast",
            "clusters": "/api/ml/clusters"
        }
    }

# Dashboard endpoints
@app.get("/api/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get overall dashboard statistics"""
    return data_cache.get('summary', {})

@app.get("/api/states", response_model=List[StateData])
async def get_all_states():
    """Get all states data"""
    return data_cache.get('states', [])

@app.get("/api/states/{state_name}")
async def get_state_detail(state_name: str):
    """Get detailed data for a specific state"""
    states = data_cache.get('states', [])
    
    # Find state (case-insensitive partial match)
    matching_states = [
        s for s in states 
        if state_name.lower() in s['state'].lower()
    ]
    
    if not matching_states:
        raise HTTPException(status_code=404, detail=f"State '{state_name}' not found")
    
    return matching_states[0]

@app.get("/api/districts")
async def get_districts(state: Optional[str] = None):
    """Get districts data, optionally filtered by state"""
    districts = data_cache.get('districts', [])
    
    if state:
        districts = [
            d for d in districts 
            if state.lower() in d['state'].lower()
        ]
    
    return districts

@app.get("/api/timeseries")
async def get_timeseries():
    """Get time series data for forecasting"""
    return data_cache.get('timeSeries', [])

# ML endpoints
@app.get("/api/ml/anomalies")
async def get_anomalies():
    """Get anomaly detection results"""
    if not analytics_cache:
        # Return mock if real analytics missing
        return []
    
    anomalies = analytics_cache.get('anomaly_detection', [])
    
    # Add human-friendly explanations
    for anomaly in anomalies:
        ratio = anomaly.get('update_ratio', 0)
        state = anomaly.get('state', 'Unknown')
        
        if ratio > 50:
            anomaly['explanation'] = f"⚠️ {state} is processing {ratio:.0f}x more updates than enrolments, indicating intensive re-validation campaign or data migration activity."
        elif ratio > 20:
            anomaly['explanation'] = f"📊 {state} shows high update activity ({ratio:.0f}x ratio), suggesting active demographic update drives."
        else:
            anomaly['explanation'] = f"✓ {state} maintains healthy update-to-enrolment ratio of {ratio:.1f}x."
    
    return anomalies

@app.get("/api/ml/forecast")
async def get_forecast():
    """Get forecasting results"""
    if not analytics_cache:
        return {}
    
    forecast = analytics_cache.get('forecasting', {})
    
    # Add interpretation
    growth = forecast.get('growth_percent', 0)
    if growth > 0:
        forecast['interpretation'] = f"📈 Enrolment velocity increasing by {growth:.1f}% over next 30 days"
    elif growth < -10:
        forecast['interpretation'] = f"⚠️ Declining trend ({growth:.1f}%) - Consider launching re-enrollment drives"
    else:
        forecast['interpretation'] = f"➡️ Stable enrolment pattern with {abs(growth):.1f}% variance"
    
    return forecast

@app.get("/api/ml/clusters")
async def get_clusters():
    """Get clustering results"""
    if not analytics_cache:
        return {}
    
    clustering = analytics_cache.get('clustering', {})
    
    # Add descriptions
    tier_descriptions = {
        "Critical_Hubs": "🎯 Priority districts requiring immediate infrastructure expansion",
        "High_Activity": "📊 High-performing centers maintaining strong enrollment momentum",
        "Moderate_Activity": "✓ Steady growth regions with stable operations",
        "Low_Activity": "⚠️ Under-penetrated zones requiring urgent intervention"
    }
    
    clustering['tier_descriptions'] = tier_descriptions
    
    return clustering

@app.get("/api/ml/saturation")
async def get_saturation():
    """Get saturation analysis"""
    if not analytics_cache:
        return {}
    
    return analytics_cache.get('saturation_analysis', {})

@app.get("/api/ml/rural-urban")
async def get_rural_urban_analysis():
    """Get rural-urban distribution analysis"""
    if not analytics_cache:
        return {}
    
    return analytics_cache.get('rural_urban_analysis', {})

@app.get("/api/recommendations")
async def get_recommendations(state: Optional[str] = None):
    """Get state-specific recommendations"""
    if not analytics_cache:
        return []
    
    recommendations = analytics_cache.get('state_recommendations', [])
    
    if state:
        recommendations = [
            r for r in recommendations 
            if state.lower() in r['state'].lower()
        ]
        
        if not recommendations:
            return []
    
    return recommendations

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "data_loaded": data_cache is not None,
        "analytics_loaded": analytics_cache is not None,
        "total_states": len(data_cache.get('states', [])) if data_cache else 0,
        "total_districts": len(data_cache.get('districts', [])) if data_cache else 0
    }

if __name__ == "__main__":
    print("\n" + "="*60)
    print("AADHAARIQ FASTAPI BACKEND")
    print("="*60)
    print(f"Data loaded: {len(data_cache.get('states', [])) if data_cache else 0} states")
    print(f"Analytics loaded: {'Yes' if analytics_cache else 'No'}")
    print("\nStarting server at http://localhost:8001")
    print("API Docs: http://localhost:8001/docs")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
