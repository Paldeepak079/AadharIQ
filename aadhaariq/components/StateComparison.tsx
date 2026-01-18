
import React, { useState } from 'react';
import { translations } from '../translations';
import { Language, AadhaarData } from '../types';
import { INDIA_STATES_DATA } from '../data/realData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, RefreshCw, Baby, Activity, ArrowLeftRight, Search } from 'lucide-react';

interface StateComparisonProps {
  lang: Language;
}

const StateComparison: React.FC<StateComparisonProps> = ({ lang }) => {
  const t = translations[lang];
  const [state1, setState1] = useState<AadhaarData>(INDIA_STATES_DATA[0]);
  const [state2, setState2] = useState<AadhaarData>(INDIA_STATES_DATA[1]);

  const chartData = [
    {
      metric: 'Enrolments (Cr)',
      [state1.state]: state1.enrolments / 10000000,
      [state2.state]: state2.enrolments / 10000000,
    },
    {
      metric: 'Updates (Cr)',
      [state1.state]: state1.updates / 10000000,
      [state2.state]: state2.updates / 10000000,
    },
    {
      metric: 'Child Enrol (M)',
      [state1.state]: state1.childEnrolments / 1000000,
      [state2.state]: state2.childEnrolments / 1000000,
    },
    {
      metric: 'Anomaly (%)',
      [state1.state]: state1.anomalyScore * 100,
      [state2.state]: state2.anomalyScore * 100,
    }
  ];

  const MetricRow = ({ icon: Icon, label, val1, val2, unit = "" }: any) => (
    <div className="grid grid-cols-3 gap-4 items-center py-4 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-2 text-gray-500">
        <Icon className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-right font-black text-white text-lg">
        {val1}{unit}
      </div>
      <div className="text-right font-black text-orange-400 text-lg">
        {val2}{unit}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <h2 className="text-2xl font-bold devanagari-header flex items-center gap-3">
          <ArrowLeftRight className="text-orange-500 w-6 h-6" />
          {t.compareStates}
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <select
            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500 min-w-[200px]"
            value={state1.state}
            onChange={(e) => setState1(INDIA_STATES_DATA.find(s => s.state === e.target.value)!)}
          >
            {INDIA_STATES_DATA.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
          </select>
          <div className="flex items-center justify-center">
            <ArrowLeftRight className="text-gray-600 w-4 h-4 hidden sm:block" />
          </div>
          <select
            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500 min-w-[200px]"
            value={state2.state}
            onChange={(e) => setState2(INDIA_STATES_DATA.find(s => s.state === e.target.value)!)}
          >
            {INDIA_STATES_DATA.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Comparative Metrics Table */}
        <div className="glass-panel p-8 rounded-3xl">
          <div className="grid grid-cols-3 gap-4 mb-6 pb-4 border-b border-gray-800">
            <div className="text-[10px] text-gray-500 font-bold uppercase">KPIs</div>
            <div className="text-right text-xs font-bold text-white truncate">{state1.state}</div>
            <div className="text-right text-xs font-bold text-orange-500 truncate">{state2.state}</div>
          </div>

          <MetricRow
            icon={Users}
            label="Enrolments"
            val1={(state1.enrolments / 10000000).toFixed(2)}
            val2={(state2.enrolments / 10000000).toFixed(2)}
            unit=" Cr"
          />
          <MetricRow
            icon={RefreshCw}
            label="Updates"
            val1={(state1.updates / 10000000).toFixed(2)}
            val2={(state2.updates / 10000000).toFixed(2)}
            unit=" Cr"
          />
          <MetricRow
            icon={Baby}
            label="Child Enrol"
            val1={(state1.childEnrolments / 1000000).toFixed(2)}
            val2={(state2.childEnrolments / 1000000).toFixed(2)}
            unit=" M"
          />
          <MetricRow
            icon={Activity}
            label="Anomaly Score"
            val1={(state1.anomalyScore * 100).toFixed(0)}
            val2={(state2.anomalyScore * 100).toFixed(0)}
            unit="%"
          />
          <MetricRow
            icon={Search}
            label="Rural Ratio"
            val1={state1.ruralRatio ?? "N/A"}
            val2={state2.ruralRatio ?? "N/A"}
            unit={state1.ruralRatio ? "%" : ""}
          />
          <MetricRow
            icon={Search}
            label="Urban Ratio"
            val1={state1.urbanRatio ?? "N/A"}
            val2={state2.urbanRatio ?? "N/A"}
            unit={state1.urbanRatio ? "%" : ""}
          />
        </div>

        {/* Visual Comparison Chart */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col">
          <h3 className="text-lg font-bold mb-8 devanagari-header">{t.metricComparison}</h3>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="metric" stroke="#666" fontSize={10} tickLine={false} />
                <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid #444', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Bar dataKey={state1.state} fill="#ffffff" radius={[4, 4, 0, 0]} />
                <Bar dataKey={state2.state} fill="#FF9933" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Societal Trend Analysis Overlay - REMOVED Fake Interpretative Text */}
      <div className="glass-panel p-8 rounded-3xl border-t-2 border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-transparent">
        <h3 className="text-lg font-bold mb-4">Comparative Data Summary</h3>
        <p className="text-sm text-gray-400 leading-relaxed max-w-4xl">
          Statistical comparison between <span className="text-white font-bold">{state1.state}</span> and <span className="text-orange-500 font-bold">{state2.state}</span>.
          {state1.anomalyScore > state2.anomalyScore
            ? ` ${state1.state} shows a higher deviation (${(state1.anomalyScore * 100).toFixed(0)}%) from the national update/enrolment baseline compared to ${state2.state} (${(state2.anomalyScore * 100).toFixed(0)}%).`
            : ` ${state2.state} shows a higher deviation (${(state2.anomalyScore * 100).toFixed(0)}%) from the national update/enrolment baseline compared to ${state1.state} (${(state1.anomalyScore * 100).toFixed(0)}%).`
          }
        </p>
      </div>
    </div>
  );
};

export default StateComparison;
