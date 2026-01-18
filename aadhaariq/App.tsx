
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GeospatialMap from './components/GeospatialMap';
import MLInsights from './components/MLInsights';
import InsightEngine from './components/InsightEngine';
import StateComparison from './components/StateComparison';
import PredictiveDemand from './components/PredictiveDemand';
import { AppState } from './types';
import { translations } from './translations';
import { generatePolicyPDF } from './services/pdfGenerator';
import { DATA_SUMMARY } from './data/realData';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    lang: 'EN',
    selectedState: null,
    loading: false,
  });
  const t = translations[state.lang];

  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard lang={state.lang} selectedState={state.selectedState} onSelect={(s) => setState(prev => ({ ...prev, selectedState: s }))} />;
      case 'comparison':
        return <StateComparison lang={state.lang} />;
      case 'map':
        return <GeospatialMap lang={state.lang} selectedState={state.selectedState} onSelect={(s) => setState(prev => ({ ...prev, selectedState: s }))} />;
      case 'ml':
        return <MLInsights lang={state.lang} selectedState={state.selectedState} />;
      case 'predictive':
        return <PredictiveDemand selectedState={state.selectedState} />;
      case 'ai':
        return <InsightEngine lang={state.lang} selectedState={state.selectedState} />;
      case 'reports':
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-2xl font-bold devanagari-header mb-8">{t.strategyReports}</h2>
            <button
              onClick={() => generatePolicyPDF({
                title: "AadhaarIQ National Strategy Report",
                summary: DATA_SUMMARY,
                insights: { insight: "National strategic analysis of Aadhaar saturation and update trends.", trends: [], actionableSteps: [] }
              })}
              className="px-12 py-4 bg-orange-600 rounded-2xl font-bold hover:bg-orange-500 transition-all flex items-center gap-3 shadow-xl shadow-orange-900/20"
            >
              {t.exportPdf}
            </button>
          </div>
        );
      default:
        return <Dashboard lang={state.lang} selectedState={state.selectedState} />;
    }
  };

  return (
    <Layout state={state} setState={setState} activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
