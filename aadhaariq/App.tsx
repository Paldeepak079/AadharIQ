
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
        return <MLInsights lang={state.lang} selectedState={state.selectedState} onSelect={(s) => setState(prev => ({ ...prev, selectedState: s }))} />;
      case 'predictive':
        return <PredictiveDemand lang={state.lang} selectedState={state.selectedState} onSelect={(s) => setState(prev => ({ ...prev, selectedState: s }))} />;
      case 'ai':
        return <InsightEngine lang={state.lang} selectedState={state.selectedState} onSelect={(s) => setState(prev => ({ ...prev, selectedState: s }))} />;
      case 'reports':
        return (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="glass-panel p-8 rounded-3xl max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold devanagari-header mb-4 text-center bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">{t.strategyReports}</h2>
              <p className="text-gray-400 text-center mb-8">Comprehensive analytical report with enrollment trends, policy recommendations, and state-wise performance metrics</p>

              {/* Report Preview */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-blue-500/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="text-blue-400">📊</span> Executive Summary
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Total National Enrollments: {(DATA_SUMMARY.totalEnrolments / 10000000).toFixed(2)} Cr</li>
                    <li>• Total Updates: {(DATA_SUMMARY.totalUpdates / 10000000).toFixed(2)} Cr</li>
                    <li>• Child Coverage: {(DATA_SUMMARY.totalChildEnrolments / 1000000).toFixed(2)}M</li>
                    <li>• States Analyzed: {DATA_SUMMARY.totalStates}</li>
                    <li>• Districts Covered: {DATA_SUMMARY.totalDistricts}</li>
                  </ul>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-green-500/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="text-green-400">🎯</span> Policy Recommendations
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Strategic intervention mapping</li>
                    <li>• State-wise action plans</li>
                    <li>• Resource allocation guidance</li>
                    <li>• Timeline and impact projections</li>
                    <li>• Priority ranking by urgency</li>
                  </ul>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-orange-500/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="text-orange-400">📈</span> Performance Analytics
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Saturation gap analysis</li>
                    <li>• Update velocity trends</li>
                    <li>• Child enrollment ratios</li>
                    <li>• Anomaly detection scores</li>
                    <li>• Demographic breakdowns</li>
                  </ul>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-purple-500/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="text-purple-400">🗺️</span> Regional Insights
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Top 10 performing states</li>
                    <li>• Critical intervention zones</li>
                    <li>• Urban vs rural metrics</li>
                    <li>• District-level hotspots</li>
                    <li>• Comparative benchmarks</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => generatePolicyPDF({
                    title: "AadhaarIQ Comprehensive Strategy Report",
                    stateName: state.selectedState,
                    summary: DATA_SUMMARY,
                    insights: {
                      insight: "This comprehensive report analyzes India's Aadhaar enrollment ecosystem with data-driven insights across 39 states and union territories. Key findings include enrollment saturation patterns, update velocity metrics, demographic distributions, and strategic policy recommendations for achieving universal coverage.",
                      trends: [],
                      actionableSteps: [
                        "Deploy mobile enrollment centers to 12 underperforming states with <70% saturation",
                        "Launch Baal Aadhaar awareness campaigns targeting 0-5 age group through schools and anganwadis",
                        "Upgrade biometric infrastructure in high-traffic urban centers to reduce update processing time",
                        "Implement rural outreach programs in districts showing enrollment gaps >15%",
                        "Establish dedicated helpdesks for elderly population to facilitate update processes"
                      ]
                    }
                  })}
                  className="px-12 py-4 bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl font-bold hover:from-orange-500 hover:to-orange-400 transition-all flex items-center gap-3 shadow-2xl shadow-orange-900/30 text-lg">
                  <span className="text-2xl">📄</span>
                  {t.exportPdf}
                </button>
              </div>
            </div>
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
