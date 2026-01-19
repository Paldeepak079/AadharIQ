# AadhaarIQ - Intelligent Aadhaar Analytics Platform

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
- Side-by-side state performance analysis
- Multi-metric comparisons
- Visual trend indicators
- Comprehensive data tables

### 🌍 Multi-Language Support
- English and Hindi interface
- Context-aware tooltips
- Localized terminology

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+ (for backend)
- npm or yarn

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd aadhaariq
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
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

Developed by the AadhaarIQ team for better visualization and understanding of India's digital identity infrastructure.

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**Note**: This is a data analytics tool designed for visualization and insight generation. It does not store or process any personally identifiable information (PII).
