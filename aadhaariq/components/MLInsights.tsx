
import React from 'react';
import { translations } from '../translations';
import { Language } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TIME_SERIES_DATA, INDIA_STATES_DATA } from '../data/realData';
import { AlertTriangle, TrendingUp, ShieldCheck, BrainCircuit, Users, TrendingDown, Activity } from 'lucide-react';
import UrbanRuralVelocityChart from './UrbanRuralVelocityChart';
import AgeGroupDistribution from './AgeGroupDistribution';

interface MLProps {
  lang: Language;
}

const MLInsights: React.FC<MLProps> = ({ lang }) => {
  const t = translations[lang];

  // Generate anomalies from real state data
  const anomalies = INDIA_STATES_DATA
    .filter(s => s.anomalyScore > 0.5)
    .sort((a, b) => b.anomalyScore - a.anomalyScore)
    .slice(0, 5)
    .map((state, idx) => ({
      id: idx + 1,
      type: state.anomalyScore > 0.8 ? 'CRITICAL' : 'SOCIETAL',
      title: `${state.state}: Unusual Activity Pattern`,
      description: `Deviation from national trend: ${(state.anomalyScore * 100).toFixed(0)}%. ${state.updates > state.enrolments * 30 ? 'High Update Surge.' : 'Low Enrolment Velocity.'}`,
      region: state.state
    }));

  // Calculate authentic insights
  const highUpdateState = [...INDIA_STATES_DATA].sort((a, b) => b.updates - a.updates)[0];
  const highGrowthState = [...INDIA_STATES_DATA].sort((a, b) => b.childEnrolments - a.childEnrolments)[0];
  const lowEnrollmentState = [...INDIA_STATES_DATA].sort((a, b) => a.enrolments - b.enrolments)[0];
  const highestAdultEnrollment = [...INDIA_STATES_DATA].sort((a, b) => b.enrolment_18_plus - a.enrolment_18_plus)[0];
  const highestYouthEnrollment = [...INDIA_STATES_DATA].sort((a, b) => b.enrolment_5_17 - a.enrolment_5_17)[0];
  const mostActiveState = [...INDIA_STATES_DATA].sort((a, b) => (b.enrolments + b.updates) - (a.enrolments + a.updates))[0];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Forecasting Section */}
        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-blue-500 w-6 h-6" />
            <h3 className="text-xl font-bold devanagari-header">{t.forecasting}</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6 uppercase tracking-widest font-bold">Historical Enrolment Trend (Real Data)</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TIME_SERIES_DATA.map(item => ({
                date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                actual: item.enrolments
              }))}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9933" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF9933" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid #444', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#FF9933" fillOpacity={1} fill="url(#colorActual)" name="Actual Enrolments" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly & Societal Patterns Section */}
        <div className="glass-panel p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="text-red-500 w-6 h-6" />
            <h3 className="text-xl font-bold devanagari-header">Societal Pattern Identification</h3>
          </div>
          <div className="space-y-4 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {anomalies.map((anomaly) => (
              <div key={anomaly.id} className={`p-5 rounded-2xl border transition-all ${anomaly.type === 'SOCIETAL' ? 'bg-blue-950/10 border-blue-500/20' : 'bg-red-950/10 border-red-500/20'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${anomaly.type === 'SOCIETAL' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                      {anomaly.type}
                    </span>
                    <h4 className="font-bold text-white text-sm">{anomaly.title}</h4>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold">{anomaly.region}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">{anomaly.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => alert(`Investigating anomaly in ${anomaly.region}: ${anomaly.description}`)}
                    className="px-3 py-1 bg-gray-900 border border-gray-800 rounded-lg text-[10px] font-bold text-gray-300 hover:border-orange-500 transition-colors"
                  >
                    INVESTIGATE
                  </button>
                  <button
                    onClick={() => alert(`Initiating resolution framework for ${anomaly.type} pattern in ${anomaly.region}`)}
                    className="px-3 py-1 bg-orange-600 rounded-lg text-[10px] font-bold text-white hover:bg-orange-500 transition-colors"
                  >
                    SOLVE FRAMEWORK
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urban vs Rural Velocity Chart */}
      <UrbanRuralVelocityChart />

      {/* Demographic Age Analysis Section - IMPROVED */}
      <div className="glass-panel p-8 rounded-3xl border-t-2 border-green-500/20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Expanded Insight Cards */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <BrainCircuit className="text-green-500 w-7 h-7" />
              <div>
                <h3 className="text-xl font-black devanagari-header">Demographic & Economic Clustering</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Statistical Pattern Analysis</p>
              </div>
            </div>

            {/* Grid with 6 Insight Cards - NO SCROLLBAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: High Maintenance Zone */}
              <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-orange-500 transition-all cursor-default group">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center mb-3 group-hover:bg-orange-500 transition-colors">
                  <Users className="w-4 h-4 text-orange-400 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-orange-400 text-sm mb-1">High Maintenance Zone</h4>
                <p className="text-[10px] text-gray-500 leading-normal">
                  {highUpdateState.state} leads with {(highUpdateState.updates / 1000000).toFixed(2)}M updates, adhering to the standard 10-year refresh protocol.
                </p>
              </div>

              {/* Card 2: High Growth Corridor */}
              <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-green-500 transition-all cursor-default group">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mb-3 group-hover:bg-green-500 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-green-400 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-green-400 text-sm mb-1">High Growth Corridor</h4>
                <p className="text-[10px] text-gray-500 leading-normal">
                  {highGrowthState.state} shows peak child enrolment ({(highGrowthState.childEnrolments / 1000000).toFixed(2)}M), indicating active youth registration drives.
                </p>
              </div>

              {/* Card 3: Adult Enrollment Leader */}
              <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-blue-500 transition-all cursor-default group">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:bg-blue-500 transition-colors">
                  <Activity className="w-4 h-4 text-blue-400 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-blue-400 text-sm mb-1">Adult Enrollment Leader</h4>
                <p className="text-[10px] text-gray-500 leading-normal">
                  {highestAdultEnrollment.state} dominates adult (18+) registrations with {(highestAdultEnrollment.enrolment_18_plus / 1000000).toFixed(2)}M enrollments.
                </p>
              </div>

              {/* Card 4: Youth Registration Hub */}
              <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-yellow-500 transition-all cursor-default group">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center mb-3 group-hover:bg-yellow-500 transition-colors">
                  <TrendingUp className="w-4 h-4 text-yellow-400 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-yellow-400 text-sm mb-1">Youth Registration Hub</h4>
                <p className="text-[10px] text-gray-500 leading-normal">
                  {highestYouthEnrollment.state} leads youth (5-18) segment with {(highestYouthEnrollment.enrolment_5_17 / 1000000).toFixed(2)}M enrollments.
                </p>
              </div>

              {/* Card 5: Most Active State */}
              <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-purple-500 transition-all cursor-default group">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover:bg-purple-500 transition-colors">
                  <Activity className="w-4 h-4 text-purple-400 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-purple-400 text-sm mb-1">Most Active Region</h4>
                <p className="text-[10px] text-gray-500 leading-normal">
                  {mostActiveState.state} shows highest combined activity with {((mostActiveState.enrolments + mostActiveState.updates) / 1000000).toFixed(2)}M total transactions.
                </p>
              </div>

              {/* Card 6: Emerging Territory */}
              <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-red-500 transition-all cursor-default group">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mb-3 group-hover:bg-red-500 transition-colors">
                  <TrendingDown className="w-4 h-4 text-red-400 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-red-400 text-sm mb-1">Emerging Territory</h4>
                <p className="text-[10px] text-gray-500 leading-normal">
                  {lowEnrollmentState.state} shows opportunity zone with {(lowEnrollmentState.enrolments / 1000000).toFixed(2)}M enrollments, indicating expansion potential.
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Age Group Distribution */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <AgeGroupDistribution />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLInsights;
