
import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { INDIA_STATES_DATA } from '../data/realData';
import { translations } from '../translations';
import { Language } from '../types';
import { Info, Target, Zap, Waves } from 'lucide-react';

interface IntersectionExplorerProps {
    lang: Language;
    selectedState?: string | null;
}

const IntersectionExplorer: React.FC<IntersectionExplorerProps> = ({ lang, selectedState }) => {
    const t = translations[lang];
    const [xAxis, setXAxis] = useState<'childRatio' | 'enrolmentVelocity'>('childRatio');

    const chartData = useMemo(() => {
        return INDIA_STATES_DATA.map(state => {
            const totalActivity = state.enrolments + state.updates;
            const childRatio = (state.childEnrolments / Math.max(state.enrolments, 1)) * 100;
            const biometricRatio = (state.biometricUpdates / Math.max(state.updates, 1)) * 100;
            const enrolmentVelocity = (state.enrolments / Math.max(state.updates, 1)) * 100;

            return {
                name: state.state,
                x: xAxis === 'childRatio' ? childRatio : enrolmentVelocity,
                y: biometricRatio,
                z: totalActivity,
                anomaly: state.anomalyScore,
                raw: {
                    enrolments: state.enrolments,
                    updates: state.updates,
                    childRatio: childRatio.toFixed(1),
                    biometricRatio: biometricRatio.toFixed(1)
                }
            };
        });
    }, [xAxis]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="glass-panel p-4 border border-orange-500/30 bg-gray-900/95 shadow-2xl rounded-xl">
                    <p className="text-orange-500 font-black text-lg mb-2">{data.name}</p>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between gap-8">
                            <span className="text-gray-400 uppercase font-bold">Child Enrol %:</span>
                            <span className="text-white font-mono">{data.raw.childRatio}%</span>
                        </div>
                        <div className="flex justify-between gap-8">
                            <span className="text-gray-400 uppercase font-bold">Biometric Update %:</span>
                            <span className="text-white font-mono">{data.raw.biometricRatio}%</span>
                        </div>
                        <div className="flex justify-between gap-8">
                            <span className="text-gray-400 uppercase font-bold">Total Operations:</span>
                            <span className="text-green-400 font-mono">{(data.z / 1000000).toFixed(2)}M</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold devanagari-header flex items-center gap-2">
                        <Zap className="text-yellow-500 w-6 h-6" />
                        Operational Intersection Explorer
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Analyzing correlations across multiple data dimensions</p>
                </div>

                <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
                    <button
                        onClick={() => setXAxis('childRatio')}
                        className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${xAxis === 'childRatio' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        CHILD RATIO
                    </button>
                    <button
                        onClick={() => setXAxis('enrolmentVelocity')}
                        className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${xAxis === 'enrolmentVelocity' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        ENROLMENT VELOCITY
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-3 glass-panel p-8 rounded-3xl min-h-[500px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Waves className="w-64 h-64 text-orange-500" />
                    </div>

                    <div className="flex-1 w-full h-full min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name={xAxis === 'childRatio' ? 'Child %' : 'Velocity'}
                                    unit="%"
                                    stroke="#666"
                                    fontSize={10}
                                    label={{ value: xAxis === 'childRatio' ? 'Child Enrollment Ratio (%)' : 'Enrollment Velocity (vs Updates)', position: 'bottom', offset: 20, fill: '#666', fontSize: 10, fontWeight: 700 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name="Biometric %"
                                    unit="%"
                                    stroke="#666"
                                    fontSize={10}
                                    label={{ value: 'Biometric Update Frequency (%)', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 10, fontWeight: 700 }}
                                />
                                <ZAxis type="number" dataKey="z" range={[50, 1500]} name="Volume" />
                                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="States" data={chartData}>
                                    {chartData.map((entry, index) => {
                                        const isSelected = selectedState && entry.name.toLowerCase() === selectedState.toLowerCase();
                                        return (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={isSelected ? '#3b82f6' : (entry.anomaly > 0.6 ? '#ef4444' : entry.x > 50 ? '#22c55e' : '#f97316')}
                                                fillOpacity={isSelected ? 1 : 0.7}
                                                stroke={isSelected ? '#fff' : (entry.anomaly > 0.6 ? '#fca5a5' : '#fff')}
                                                strokeWidth={isSelected ? 3 : (entry.anomaly > 0.6 ? 2 : 1)}
                                            />
                                        );
                                    })}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights Panel */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-3xl border-l-4 border-yellow-500 bg-gradient-to-br from-yellow-500/5 to-transparent">
                        <div className="flex items-center gap-2 text-yellow-500 mb-3">
                            <Target className="w-5 h-5" />
                            <h3 className="font-bold text-sm uppercase tracking-tighter">Cluster Diagnostics</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-gray-900/50 rounded-xl border border-gray-800">
                                <p className="text-[10px] text-red-400 font-bold uppercase mb-1">Anomaly Hubs</p>
                                <p className="text-xs text-gray-400">States in RED show high deviation from national update patterns.</p>
                            </div>
                            <div className="p-3 bg-gray-900/50 rounded-xl border border-gray-800">
                                <p className="text-[10px] text-green-400 font-bold uppercase mb-1">Enrollment Leaders</p>
                                <p className="text-xs text-gray-400">States in GREEN have high child-to-adult enrollment ratios.</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border-l-4 border-orange-500 bg-gradient-to-br from-orange-500/5 to-transparent">
                        <div className="flex items-center gap-2 text-orange-500 mb-3">
                            <Info className="w-5 h-5" />
                            <h3 className="font-bold text-sm uppercase tracking-tighter">Bubble Scaling</h3>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Bubble size represents total aggregate activity (New Enrolments + Lifetime Updates).
                            Larger bubbles indicate states requiring greater infrastructure footprint.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntersectionExplorer;
