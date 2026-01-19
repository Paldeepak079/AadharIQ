# AadhaarIQ - https://aadhariq.netlify.app/
<img width="1894" height="971" alt="image" src="https://github.com/user-attachments/assets/c37a9668-5d47-4afa-9664-ab4a68496852" />
<img width="1907" height="967" alt="image" src="https://github.com/user-attachments/assets/2dc300bf-4c0e-4a35-a44f-88add0eb713b" />
<img width="1917" height="967" alt="image" src="https://github.com/user-attachments/assets/426ca434-4062-4162-9819-6c349cafff02" />
<img width="1907" height="968" alt="image" src="https://github.com/user-attachments/assets/5204e554-5923-4262-b2cd-c3c24810ec03" />
<img width="1910" height="965" alt="image" src="https://github.com/user-attachments/assets/6d7b30eb-7bae-45a3-90d2-623df70b924d" />
<img width="1908" height="973" alt="image" src="https://github.com/user-attachments/assets/275e99a4-89c5-4911-89a9-3e9ac9501f62" />

- **Data Source**: UIDAI Open Datasets
## 📄 License

This project uses real UIDAI data for educational/analytical purposes.

---
 
A comprehensive data analytics dashboard for visualizing and analyzing Aadhaar enrollment patterns, demographic trends, and regional insights across India.

## 📊 Overview

AadhaarIQ transforms complex Aadhaar enrollment data into actionable insights through interactive visualizations, real-time analytics, and predictive forecasting. Built to help policymakers and administrators identify coverage gaps, track enrollment trends, and make data-driven decisions.

## ✨ Key Features

### 📈 Interactive Analytics Dashboard
- Real-time enrollment statistics and trends
- Age-based demographic breakdowns (0-5, 5-17, 18+)
- Biometric vs Demographic update tracking
- State-wise performance metrics

### 🗺️ Geospatial Visualization
- Interactive India map with state and district-level data
- Enrollment density heatmaps
- Dual-mode viewing (Activity & Saturation Gap)
- Dynamic tooltips with contextual information

### 🔮 Predictive Forecasting
- Time-series analysis using Holt-Winters algorithm
- 30-day enrollment projections
- Trend detection and anomaly identification
- Confidence scoring for predictions

### 📊 State Comparison Tool
# AadhaarIQ - Intelligent Enrollment Analytics Platform

![AadhaarIQ Banner](https://img.shields.io/badge/UIDAI-Hackathon%202026-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

> **India's First Dark Zone Early Warning System** — Predicting enrollment crises 6 months before they happen, transforming reactive firefighting into strategic foresight.

---

## 🎯 **Overview**

AadhaarIQ analyzes **5.3+ million Aadhaar enrollment records** across 39 states and 734 districts to identify:
- Geographic saturation gaps
- Demographic enrollment patterns  
- Predictive dark zones (6-month forecasts)
- Policy intervention priorities

**Key Features**:
- 📊 Interactive dashboards with real-time metrics
- 🗺️ Geospatial mapping (state & district levels)
- 🔮 ML-based forecasting (Holt-Winters ~ 8.4% MAPE)
- 🎯 Automated policy action mapping
- 🌐 Multi-language support (English/Hindi)

---

## 🚀 **Quick Start**

### Prerequisites
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8003
   ```

API will be available at `http://localhost:8003`

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Plotly.js** - Interactive map visualizations
- **Framer Motion** - Smooth animations
- **Recharts** - Chart components

### Backend
- **FastAPI** - Modern Python web framework
- **Pandas** - Data processing and analysis
- **NumPy** - Numerical computations
- **Uvicorn** - ASGI server

## 📁 Project Structure

```
aadhaariq/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── GeospatialMap.tsx
│   ├── StateComparison.tsx
│   └── GlossaryTerm.tsx
├── data/               # Data files and configurations
├── public/             # Static assets
└── ...

backend/
├── main.py            # FastAPI application
├── requirements.txt   # Python dependencies
└── ...
```

## 📊 Data Sources

- Aadhaar enrollment records (processed from official data)
- Census 2011 population statistics (projected to 2024)
- District-level geographic coordinates
- State and UT administrative boundaries

## 🎯 Key Metrics Tracked

- **Total Enrollments**: Cumulative Aadhaar registrations
- **Update Velocity**: Rate of record updates
- **Saturation Gap**: Difference between population and enrolled citizens
- **Child Coverage**: 0-18 age group enrollment percentage
- **Anomaly Scores**: Statistical deviation from national patterns
- **Enrollment Density**: Enrollments per office/center

## 🔧 Configuration

Create a `.env.local` file in the `aadhaariq` directory:

```env
VITE_API_BASE_URL=http://localhost:8003
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is developed for educational and analytical purposes. Please ensure compliance with data protection regulations when handling Aadhaar-related information.

## 👥 Team

Developed by the MADTech team for better visualization and understanding of India's digital identity infrastructure.
---

**Note**: This is a data analytics tool designed for visualization and insight generation. It does not store or process any personally identifiable information (PII).
