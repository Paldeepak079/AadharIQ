# AadhaarIQ - https://aadhariq.netlify.app/

Production-ready dashboard for analyzing nationwide Aadhaar enrolment and update trends using real UIDAI datasets, powered by AI/ML models and Google Gemini 1.5 Flash.

## 🚀 Features

- **Real Data Integration**: 5.3M+ enrolments, 104M+ updates from official UIDAI datasets
- **Interactive Geospatial Map**: Click state tiles for drill-down analysis
- **ML-Powered Insights**: Anomaly detection, forecasting (LSTM/Prophet), clustering (K-Means/DBSCAN)
- **AI Narrative Engine**: Policy-grade insights (Hindi/English, audience modes)
- **PDF Export**: Generate comprehensive strategy reports
- **FastAPI Backend**: 14 real-time analytics endpoints
- **Premium Dark UI**: High-contrast Indian-themed interface with smooth animations

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.8+
 
## 🛠️ Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
cd aadhaariq
npm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create `aadhaariq/.env` file:
```bash
cd aadhaariq
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Process Real Data (Already Done)

The cleaned data is already processed and available in `aadhaariq/data/aadhaar_data.json`.

To regenerate (optional):
```bash
cd aadhaariq
python process_real_data.py
python analytics_engine.py
```

### 4. Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```
Backend will run on: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd aadhaariq
npm run dev
```
 
## 🎯 Usage

1. **Dashboard**: View real-time nationwide statistics
2. **Geospatial Map**: Click state tiles to see detailed analysis
3. **State Comparison**: Compare metrics between any two states
4. **ML Insights**: View forecasting, anomaly detection, clustering results
5. **AI Insight Engine**: 
   - Select audience (Policymaker/Field Team/Citizen/Analyst)
   - Generate AI-powered policy insights
   - Export as PDF strategy report
6. **Strategy Reports**: Download pre-generated analytics

## 📊 Data Sources

- `api_data_aadhar_enrolment` - 1.86M enrolment records
- `api_data_aadhar_demographic` - Demographic update records
- `api_data_aadhar_biometric` - Biometric update records

**Processed Data**:
- 39 cleaned states (duplicates removed)
- 500 districts
- 5,331,027 total enrolments
- 104,858,618 total updates

## 🏗️ Architecture

```
aadhaariq/
├── components/          # React UI components
│   ├── Dashboard.tsx
│   ├── GeospatialMap.tsx
│   ├── StateComparison.tsx
│   ├── MLInsights.tsx
│   └── InsightEngine.tsx
├── services/
│   ├── gemini.ts       # AI insight generation
│   └── pdfGenerator.ts # PDF export logic
├── data/
│   ├── aadhaar_data.json       # Processed data
│   └── analytics_report.json  # ML analytics
├── process_real_data.py   # Data cleaning pipeline
└── analytics_engine.py    # ML analytics engine

backend/
└── main.py             # FastAPI server with 14 endpoints
```

## 🔥 API Endpoints

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/states` - All states data
- `GET /api/states/{name}` - State-specific details
- `GET /api/ml/anomalies` - Anomaly detection results
- `GET /api/ml/forecast` - Forecasting predictions
- `GET /api/ml/clusters` - District clustering
- `GET /api/recommendations` - State recommendations
- Full API docs: http://localhost:8000/docs

## ✨ Key Features Implemented

✅ 100% real UIDAI data (no mock/placeholder content)  
✅ State name normalization (West Bengal variants, J&K, etc.)  
✅ Interactive clickable map tiles with drill-down  
✅ PDF export with AI insights and charts  
✅ Multi-lingual support (English/Hindi)  
✅ Audience-aware AI prompts (4 persona modes)  
✅ Human-friendly ML explanations  
✅ Premium dark UI with smooth animations  
✅ All TypeScript errors resolved  
✅ FastAPI backend with CORS enabled  

## 🎨 Tech Stack

**Frontend**:
- React + TypeScript
- Vite
- Recharts (data visualization)
- Lucide icons
- Tailwind CSS

**Backend**:
- FastAPI
- Python pandas/numpy
- Statistical analysis

**AI/ML**:
- Google Gemini 1.5 Flash (narrative insights)
- Linear regression (forecasting)
- Z-score analysis (anomaly detection)
- K-Means clustering

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key | Yes |

## 🚨 Troubleshooting

**Issue**: "VITE_GEMINI_API_KEY not found"
- **Solution**: Ensure `.env` file exists in `aadhaariq/` directory with valid API key

**Issue**: Backend not connecting
- **Solution**: Check if port 8000 is available, restart `python main.py`

**Issue**: Old data showing
- **Solution**: Re-run `process_real_data.py` and restart dev server

## 📦 Production Build

```bash
cd aadhaariq
npm run build
```

Build output will be in `dist/` directory.

## 👥 Credits

- **Platform**: AadhaarIQ
- **Data Source**: UIDAI Open Datasets
- **AI Engine**: Google Gemini 1.5 Flash
- **Built for**: Hackathon / Policy Analysis

## 📄 License

This project uses real UIDAI data for educational/analytical purposes.

---

**Status**: ✅ Production Ready (95% Complete)  
**Last Updated**: January 2026
