
import React, { useState } from 'react';
import { translations } from '../translations';
import { Language } from '../types';
import { generatePolicyInsight, AudienceType, InsightResponse } from '../services/gemini';
import { generatePolicyPDF } from '../services/pdfGenerator';
import { Loader2, Sparkles, Globe2, Users, Building2, BarChart3, Languages } from 'lucide-react';
import { DATA_SUMMARY, INDIA_STATES_DATA } from '../data/realData';
import { API_BASE_URL } from '../src/config';
import PolicyActionMapper from './PolicyActionMapper';

interface InsightEngineProps {
  lang: Language;
  selectedState: string | null;
  onSelect?: (state: string | null) => void;
}

const InsightEngine: React.FC<InsightEngineProps> = ({ lang, selectedState, onSelect }) => {
  const t = translations[lang];
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>('policymaker');
  const [showHindi, setShowHindi] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [saturationData, setSaturationData] = useState<any[]>([]);

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/ml/saturation`)
      .then(res => res.json())
      .then(setSaturationData)
      .catch(err => console.error('Failed to load saturation data:', err));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Get real context from data
      const stateData = selectedState ? INDIA_STATES_DATA.find(s => s.state === selectedState) : null;

      const contextSummary = stateData
        ? `State: ${stateData.state}, Enrolments: ${(stateData.enrolments / 1000000).toFixed(2)}M, Updates: ${(stateData.updates / 1000000).toFixed(2)}M, Child Coverage: ${(stateData.childEnrolments / 1000000).toFixed(2)}M, Anomaly Score: ${stateData.anomalyScore}, Rural Ratio: ${stateData.ruralRatio ?? 'Data Not Available'}`
        : `National Level Analysis. Total Enrolments: ${(DATA_SUMMARY.totalEnrolments / 10000000).toFixed(2)}Cr, Total Updates: ${(DATA_SUMMARY.totalUpdates / 10000000).toFixed(2)}Cr, Child Coverage: ${(DATA_SUMMARY.totalChildEnrolments / 1000000).toFixed(2)}M`;

      const result = await generatePolicyInsight(selectedState || 'All India', contextSummary, selectedAudience);
      setInsight(result);
    } catch (error) {
      console.error('Error generating insight:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!insight) return;

    setIsExportingPDF(true);
    try {
      await generatePolicyPDF({
        title: 'AadhaarIQ Policy Insights Report',
        stateName: selectedState || 'All India',
        summary: DATA_SUMMARY,
        insights: insight,
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-8 animate-in zoom-in duration-300">
      <div className="glass-panel p-8 rounded-3xl max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-orange-500 to-green-500 rounded-2xl shadow-lg shadow-orange-500/20">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold devanagari-header text-center">{t.aiInsightEngine}</h2>
            {/* Attribution removed as requested */}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block uppercase tracking-widest font-black text-[10px]">Select Regional Focus</label>
          <select
            value={selectedState || "All India"}
            onChange={(e) => onSelect?.(e.target.value === "All India" ? null : e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest outline-none focus:border-orange-500 transition-all cursor-pointer shadow-xl"
          >
            <option value="All India">ALL INDIA (NATIONAL)</option>
            {INDIA_STATES_DATA.map(s => (
              <option key={s.state} value={s.state}>{s.state.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Audience Selector */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block">Select Target Audience</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['policymaker', 'field_team', 'citizen', 'analyst'] as AudienceType[]).map((audience) => (
              <button
                key={audience}
                onClick={() => setSelectedAudience(audience)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${selectedAudience === audience
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
              >
                {audience === 'policymaker' && '🏛️ Policymaker'}
                {audience === 'field_team' && '👷 Field Team'}
                {audience === 'citizen' && '👥 Citizen'}
                {audience === 'analyst' && '📊 Analyst'}
              </button>
            ))}
          </div>
        </div>

        {/* Auto-regenerate when audience changes */}
        {React.useEffect(() => {
          if (insight) {
            handleGenerate();
          }
        }, [selectedAudience])}

        <div className="mt-8 mb-8">
          <PolicyActionMapper selectedState={selectedState} saturationData={saturationData} />
        </div>

        {!insight ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/10">
            <Sparkles className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-500 mb-6">{t.askAI}</p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {t.generateReport}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-700">
            {/* Main Insight */}
            <div className="p-8 bg-black/40 border border-gray-800 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-32 h-32" />
              </div>

              {/* Language Toggle */}
              {insight.insightHindi && (
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => setShowHindi(!showHindi)}
                    className="text-xs bg-gray-800 px-3 py-1 rounded-lg hover:bg-gray-700 transition-all"
                  >
                    {showHindi ? '📝 Show English' : '📝 हिन्दी में देखें'}
                  </button>
                </div>
              )}

              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-lg italic font-light">
                {(showHindi && insight.insightHindi ? insight.insightHindi : insight.insight).split('\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {/* Generated text removed */}
                  <span>{new Date(insight.timestamp).toLocaleString()}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span>Cached: {insight.cacheKey ? '✓' : '✗'}</span>
                </div>
                <button
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                  className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  {isExportingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      Export Strategy Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trend Tags */}
            {insight.tags.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold">Detected Trends</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {insight.tags.map((trend, idx) => (
                    <div
                      key={idx}
                      className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${getSeverityColor(trend.severity)}`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span className="font-medium text-sm capitalize">{trend.type.replace('-', ' ')}</span>
                      <span className="text-xs opacity-60">({Math.round(trend.confidence * 100)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Steps - Only show if meaningful actions exist */}
            {insight.actionableSteps.length > 0 && insight.actionableSteps[0] !== 'Ensure internet connectivity is stable' && (
              <div className="glass-panel p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-green-500" />
                  <h3 className="font-bold">Strategic Recommendations</h3>
                </div>
                <ul className="space-y-3">
                  {insight.actionableSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <span className="text-green-400 font-bold mt-1">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-4 bg-gray-900 border border-gray-700 rounded-2xl font-bold hover:border-orange-500 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {t.exportPdf}
              </button>
              <button className="px-6 py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-500 transition-all">
                Share with Ministry
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default InsightEngine;
