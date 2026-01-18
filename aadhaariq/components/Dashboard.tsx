
import React from 'react';
import { translations } from '../translations';
import { Language, AadhaarData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { INDIA_STATES_DATA, DATA_SUMMARY } from '../data/realData';
import { TrendingUp, Users, RefreshCw, Baby, Globe2, ArrowRight } from 'lucide-react';

interface DashboardProps {
  lang: Language;
  selectedState: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ lang, selectedState: globalSelectedState }) => {
  const t = translations[lang];
  const [demographicMode, setDemographicMode] = React.useState<'india' | 'state'>('india');
  const [localSelectedState, setLocalSelectedState] = React.useState<string | null>(null);

  // Sync mode with global selection or local selection
  React.useEffect(() => {
    if (globalSelectedState) {
      setDemographicMode('state');
      setLocalSelectedState(globalSelectedState);
    }
  }, [globalSelectedState]);

  const activeState = demographicMode === 'state' ? (localSelectedState || globalSelectedState) : null;

  const filteredData = activeState
    ? INDIA_STATES_DATA.filter(s => s.state.toLowerCase().includes(activeState.toLowerCase()))
    : INDIA_STATES_DATA;

  const totalEnrolments = filteredData.reduce((acc, curr) => acc + curr.enrolments, 0);
  const totalUpdates = filteredData.reduce((acc, curr) => acc + curr.updates, 0);
  const totalChild = filteredData.reduce((acc, curr) => acc + curr.childEnrolments, 0);

  const stats = [
    { label: t.totalEnrolments, value: (totalEnrolments / 10000000).toFixed(2) + " Cr", icon: Users, color: 'text-orange-500' },
    { label: t.biometricUpdates, value: (totalUpdates / 10000000).toFixed(2) + " Cr", icon: RefreshCw, color: 'text-blue-500' },
    { label: t.childEnrolment, value: (totalChild / 1000000).toFixed(2) + " M", icon: Baby, color: 'text-green-500' },
    { label: t.societalImpact, value: t.high, icon: Globe2, color: 'text-purple-500' },
  ];

  const COLORS = ['#FF9933', '#138808', '#000080'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl hover:border-orange-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-gray-900 group-hover:bg-gray-800 transition-colors ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-bold">{s.label}</h3>
            <p className="text-2xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-6 devanagari-header flex items-center justify-between">
              <span>Age Demographics (All Regions)</span>
              <span className="text-xs font-normal text-gray-500 uppercase tracking-widest">Enrolment Distribution</span>
            </h3>
            {/* Scrollable Container for All States */}
            <div className="h-[400px] w-full overflow-y-auto pr-4 custom-scrollbar">
              <div style={{ height: `${INDIA_STATES_DATA.length * 40}px`, minHeight: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...INDIA_STATES_DATA].sort((a, b) => b.enrolments - a.enrolments)}
                    layout="vertical"
                    margin={{ left: 30, right: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                    <XAxis type="number" stroke="#666" fontSize={10} hide />
                    <YAxis
                      dataKey="state"
                      type="category"
                      stroke="#ccc"
                      fontSize={11}
                      width={150}
                      tick={{ fill: '#bbb', fontWeight: 'bold' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#121212', border: '1px solid #444', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                    <Bar dataKey="enrolment_0_5" stackId="a" fill="#138808" name="Child (0-5)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="enrolment_5_17" stackId="a" fill="#FF9933" name="Youth (5-17)" />
                    <Bar dataKey="enrolment_18_plus" stackId="a" fill="#3b82f6" name="Adult (18+)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-gray-600 text-center uppercase tracking-widest font-bold">
              Scroll to view all {INDIA_STATES_DATA.length} states/UTs
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-6 devanagari-header">{t.totalEnrolments} Trend</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData.slice(0, 9)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="state" stroke="#999" fontSize={8} />
                  <YAxis stroke="#999" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#121212', border: '1px solid #444' }} />
                  <Line type="monotone" dataKey="enrolments" stroke="#FF9933" strokeWidth={3} dot={{ r: 4, fill: '#FF9933' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl border-l-4 border-orange-500 bg-gradient-to-br from-orange-500/5 to-transparent">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-orange-500" />
              Trend Spotlight
            </h3>
            {(() => {
              // Dynamic Trend Calculation
              const maxUpdatesState = [...INDIA_STATES_DATA].sort((a, b) => b.updates - a.updates)[0];
              const maxChildState = [...INDIA_STATES_DATA].sort((a, b) => b.childEnrolments - a.childEnrolments)[0];

              return (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-900/80 rounded-2xl border border-gray-800">
                    <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-1">Operational Insight #1</p>
                    <p className="text-sm font-bold text-white mb-2">Highest Update Volume</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {maxUpdatesState.state} leads with {(maxUpdatesState.updates / 1000000).toFixed(2)}M biometic updates, indicating high re-validation activity in this region.
                    </p>
                    <button
                      onClick={() => alert(`Framework: High Volume Update Optimization\nTarget Region: ${maxUpdatesState.state}\nVolume: ${(maxUpdatesState.updates / 1000000).toFixed(2)}M`)}
                      className="mt-3 text-[10px] flex items-center gap-1 text-orange-400 hover:text-white transition-colors"
                    >
                      VIEW METRICS <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-4 bg-gray-900/80 rounded-2xl border border-gray-800">
                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-1">Operational Insight #2</p>
                    <p className="text-sm font-bold text-white mb-2">Child Enrolment Leader</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {maxChildState.state} records the highest child enrolment at {(maxChildState.childEnrolments / 1000000).toFixed(2)}M, reflecting successful youth outreach.
                    </p>
                    <button
                      onClick={() => alert(`Framework: Youth Enrolment Strategy\nTarget Region: ${maxChildState.state}\nChild Count: ${(maxChildState.childEnrolments / 1000000).toFixed(2)}M`)}
                      className="mt-3 text-[10px] flex items-center gap-1 text-green-400 hover:text-white transition-colors"
                    >
                      VIEW METRICS <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="glass-panel p-8 rounded-3xl">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Demographic Distribution</h3>
                <div className="flex bg-gray-900/50 p-1 rounded-lg border border-gray-800 shadow-inner">
                  <button
                    onClick={() => {
                      setDemographicMode('india');
                      setLocalSelectedState(null);
                    }}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${demographicMode === 'india' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    All India
                  </button>
                  <button
                    onClick={() => setDemographicMode('state')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${demographicMode === 'state' ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    State Wise
                  </button>
                </div>
              </div>

              {demographicMode === 'state' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <select
                    value={localSelectedState || ''}
                    onChange={(e) => {
                      setLocalSelectedState(e.target.value);
                      setDemographicMode('state');
                    }}
                    className="w-full px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-xl text-xs font-bold text-white focus:border-green-500 outline-none transition-all cursor-pointer shadow-xl"
                  >
                    <option value="" disabled>Select a state to analyze...</option>
                    {[...INDIA_STATES_DATA]
                      .sort((a, b) => a.state.localeCompare(b.state))
                      .map(s => (
                        <option key={s.state} value={s.state}>{s.state}</option>
                      ))
                    }
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {(() => {
                // Determine data source based on selection
                const dataToUse = demographicMode === 'state' && activeState ? filteredData : INDIA_STATES_DATA;

                const e0_5 = dataToUse.reduce((acc, curr) => acc + (curr.enrolment_0_5 || 0), 0);
                const e5_17 = dataToUse.reduce((acc, curr) => acc + (curr.enrolment_5_17 || 0), 0);
                const e18_plus = dataToUse.reduce((acc, curr) => acc + (curr.enrolment_18_plus || 0), 0);
                const total = e0_5 + e5_17 + e18_plus || 1;

                const metrics = [
                  { label: 'Child (0-5)', val: ((e0_5 / total) * 100).toFixed(1), color: 'from-green-600 to-green-400' },
                  { label: 'Youth (5-18)', val: ((e5_17 / total) * 100).toFixed(1), color: 'from-orange-600 to-orange-400' },
                  { label: 'Adults (18+)', val: ((e18_plus / total) * 100).toFixed(1), color: 'from-blue-600 to-blue-400' }
                ];

                return (
                  <>
                    <p className="text-[10px] text-gray-400 mb-4 uppercase tracking-widest font-bold flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${demographicMode === 'state' ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-pulse'}`} />
                      Viewing: <span className={demographicMode === 'state' ? 'text-green-500' : 'text-orange-500'}>
                        {demographicMode === 'state' ? (activeState || 'State Data') : 'National Aggregate'}
                      </span>
                    </p>
                    {metrics.map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          <span>{item.label}</span>
                          <span className="text-white">{item.val}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                          <div
                            className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${item.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
