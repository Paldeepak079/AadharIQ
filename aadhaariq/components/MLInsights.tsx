import React, { useEffect, useState } from 'react';
import { translations } from '../translations';
import { Language } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { BrainCircuit, Users, Activity, Zap, ArrowRight, ShieldAlert, Target } from 'lucide-react';
import { API_BASE_URL } from '../src/config';
import UrbanRuralVelocityChart from './UrbanRuralVelocityChart';
import AgeGroupDistribution from './AgeGroupDistribution';
import IntersectionExplorer from './IntersectionExplorer';

interface MLProps {
  lang: Language;
  selectedState: string | null;
}

interface Anomaly {
  type: string;
  title: string;
  desc: string;
}

const MLInsights: React.FC<MLProps> = ({ lang, selectedState }) => {
  const t = translations[lang];
  const [pulseData, setPulseData] = useState<any[]>([]);
  const [granularity, setGranularity] = useState<"daily" | "monthly">("daily");
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  const activeState = selectedState || "All India";

  // Fetch Pulse diagnostic data
  useEffect(() => {
    setLoading(true);
    // Use the forecast endpoint with 0 forecast steps for history visualization if monthly
    const url = granularity === 'daily'
      ? (activeState === "All India" ? `${API_BASE_URL}/api/ml/pulse` : `${API_BASE_URL}/api/ml/pulse?state=${encodeURIComponent(activeState)}`)
      : `${API_BASE_URL}/api/ml/forecast?state=${encodeURIComponent(activeState)}&granularity=monthly`;

    fetch(url)
      .then(res => res.json())
      .then(d => {
        const data = granularity === 'daily' ? d.pulseData : d.mergedData.filter((p: any) => p.actual !== null);
        setPulseData(data || []);

        // Fetch anomalies from forecast always
        fetch(`${API_BASE_URL}/api/ml/forecast?state=${encodeURIComponent(activeState)}`)
          .then(res => res.json())
          .then(fd => {
            setAnomalies(fd.anomalies || []);
            setLoading(false);
          });
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [activeState, granularity]);

  // Derive anomaly points (spikes) for visualization
  const anomalyPoints = pulseData.filter((d, i) => {
    if (i < 2) return false;
    const prev = (granularity === 'daily' ? pulseData[i - 1].val : pulseData[i - 1].actual) || 0;
    const curr = (granularity === 'daily' ? d.val : d.actual) || 0;
    const threshold = granularity === 'daily' ? 1.35 : 1.5;
    return curr > prev * threshold;
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Diagnostic Activity Pulse Section */}
        <div className="glass-panel p-8 rounded-3xl border-t-4 border-orange-500 bg-gradient-to-br from-orange-500/5 to-transparent">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Target className="text-orange-500 w-7 h-7" />
              <div>
                <h3 className="text-xl font-black text-white">
                  {activeState === "All India" ? "National Activity Pulse" : `${activeState}: Diagnostic Pulse`}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Velocity tracking</p>
                  <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-0.5 no-print ml-2">
                    <button
                      onClick={() => setGranularity("daily")}
                      className={`px-3 py-0.5 text-[8px] font-black rounded-md transition-all ${granularity === "daily" ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      DAILY
                    </button>
                    <button
                      onClick={() => setGranularity("monthly")}
                      className={`px-3 py-0.5 text-[8px] font-black rounded-md transition-all ${granularity === "monthly" ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      MONTHLY
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-600/20 px-4 py-2 rounded-xl border border-orange-500/30">
              <span className="text-xs font-black text-orange-400 uppercase tracking-widest">{activeState}</span>
            </div>
          </div>

          <div className="h-[320px] w-full relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-10 rounded-2xl">
                <Activity className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <AreaChart data={pulseData}>
                <defs>
                  <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff9800" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="label" stroke="#666" fontSize={10} tick={{ fill: '#888', fontWeight: 'bold' }} interval={granularity === 'daily' ? 4 : 1} />
                <YAxis stroke="#666" fontSize={10} tick={{ fill: '#888', fontWeight: 'bold' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c0c0c', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />

                {/* Anomaly highlights removed to fix Recharts typing issues in specific environments */}

                <Area
                  type="monotone"
                  dataKey={granularity === 'daily' ? 'val' : 'actual'}
                  stroke="#ff9800"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPulse)"
                  name={granularity === 'daily' ? "Daily Load" : "Monthly Load"}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 p-4 bg-orange-500/5 rounded-xl border border-orange-500/10 flex gap-4 items-center">
            <Zap className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
              {granularity === 'daily'
                ? "Analyzing high-frequency bursts (last 90 days) to detect real-time infrastructure friction."
                : "Historical strategic overview aggregated by month to identify long-term capacity shifts."}
            </p>
          </div>
        </div>

        {/* Anomaly Context & Dynamic Narratives */}
        <div className="glass-panel p-8 rounded-3xl border-t-4 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-8">
            <ShieldAlert className="text-red-500 w-7 h-7" />
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Diagnostic identification</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">Cross-referencing regional volatility</p>
            </div>
          </div>
          <div className="space-y-4 h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {anomalies.length > 0 ? anomalies.map((anomaly, i) => (
              <div key={i} className={`p-5 rounded-2xl border transition-all ${anomaly.type === 'SOCIETAL' ? 'bg-blue-950/20 border-blue-500/20' : 'bg-red-950/20 border-red-500/30'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${anomaly.type === 'SOCIETAL' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                      {anomaly.type}
                    </span>
                    <h4 className="font-bold text-white text-sm">{anomaly.title}</h4>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{anomaly.desc}</p>
                <div className="flex gap-2">
                  <button
                    title="Drill into state-level data triggering this anomaly"
                    className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-[10px] font-black text-gray-400 hover:border-orange-500 transition-all uppercase tracking-widest group flex items-center gap-2"
                  >
                    Investigate <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    title="See recommended intervention strategy by district"
                    className="px-4 py-2 bg-red-600/20 border border-red-600/30 rounded-xl text-[10px] font-black text-red-500 hover:bg-red-600/40 transition-all uppercase tracking-widest"
                  >
                    Mitigate Risk
                  </button>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <Activity className="w-10 h-10 text-gray-600 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No anomalous pulses detected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <IntersectionExplorer lang={lang} selectedState={activeState} />

      <UrbanRuralVelocityChart externalState={activeState} />

      <div className="glass-panel p-8 rounded-3xl border-t-2 border-green-500/20">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-8">
              <Users className="text-green-500 w-8 h-8" />
              <div>
                <h3 className="text-xl font-black text-white italic">Demographic & Economic Clustering</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">Cross-state metadata analysis</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Saturation Shield", val: "94.2%", desc: "High adult coverage achieved", color: "text-blue-400" },
                { title: "Targeted Growth", val: "High", desc: "Regional child enrolment focus", color: "text-green-400" },
                { title: "Update Friction", val: "Low", desc: "Machine efficiency within bounds", color: "text-orange-400" },
                { title: "Strategic Surplus", val: "12%", desc: "Spare operational capacity", color: "text-purple-400" }
              ].map((stat, i) => (
                <div key={i} className="p-5 bg-gray-900/40 border border-gray-800 rounded-2xl hover:bg-gray-800/60 transition-all">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.title}</p>
                  <p className={`text-lg font-black ${stat.color}`}>{stat.val}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <AgeGroupDistribution externalState={activeState} />
        </div>
      </div>
    </div>
  );
};

export default MLInsights;
