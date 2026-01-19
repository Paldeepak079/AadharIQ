
import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { INDIA_STATES_DATA } from '../data/realData';
import { Language } from '../types';
import { Target, Zap, ShieldAlert, Users, TrendingUp } from 'lucide-react';
import GlossaryTerm from './GlossaryTerm';

interface IntersectionExplorerProps {
    lang: Language;
    selectedState?: string | null;
    onSelect?: (state: string | null) => void;
}

const IntersectionExplorer: React.FC<IntersectionExplorerProps> = ({ selectedState, onSelect, lang }) => {
    // Calculate National Averages for baseline
    const stats = useMemo(() => {
        const count = INDIA_STATES_DATA.length;
        const sums = INDIA_STATES_DATA.reduce((acc, s) => ({
            childRatio: acc.childRatio + (s.childEnrolments / Math.max(s.enrolments, 1)) * 100,
            biometricRatio: acc.biometricRatio + (s.biometricUpdates / Math.max(s.updates, 1)) * 100,
            momentum: acc.momentum + (s.enrolments / Math.max(s.updates, 1)) * 100,
            volume: acc.volume + (s.enrolments + s.updates),
            anomaly: acc.anomaly + s.anomalyScore * 100
        }), { childRatio: 0, biometricRatio: 0, momentum: 0, volume: 0, anomaly: 0 });

        const avg = {
            childRatio: sums.childRatio / count,
            biometricRatio: sums.biometricRatio / count,
            momentum: sums.momentum / count,
            volume: sums.volume / count,
            anomaly: sums.anomaly / count
        };

        const current = INDIA_STATES_DATA.find(s => s.state === selectedState) || null;
        const currentData = current ? {
            childRatio: (current.childEnrolments / Math.max(current.enrolments, 1)) * 100,
            biometricRatio: (current.biometricUpdates / Math.max(current.updates, 1)) * 100,
            momentum: (current.enrolments / Math.max(current.updates, 1)) * 100,
            volume: (current.enrolments + current.updates),
            anomaly: current.anomalyScore * 100
        } : avg;

        // Max volume for normalization
        const maxVol = Math.max(...INDIA_STATES_DATA.map(s => s.enrolments + s.updates));

        return [
            { subject: 'Child Saturation', A: currentData.childRatio, B: avg.childRatio, fullMark: 100 },
            { subject: 'Biometric Duty', A: currentData.biometricRatio, B: avg.biometricRatio, fullMark: 100 },
            { subject: 'Enrol Momentum', A: Math.min(100, currentData.momentum), B: Math.min(100, avg.momentum), fullMark: 100 },
            { subject: 'Traffic Volume', A: (currentData.volume / maxVol) * 100, B: (avg.volume / maxVol) * 100, fullMark: 100 },
            { subject: 'Anomaly Index', A: currentData.anomaly, B: avg.anomaly, fullMark: 100 },
        ];
    }, [selectedState]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <GlossaryTerm term="Multivariate State Profile" lang={lang} side="bottom">
                        <h2 className="text-xl font-black devanagari-header flex items-center gap-2 text-white uppercase tracking-widest hover:text-orange-500 transition-colors">
                            <Zap className="text-yellow-500 w-6 h-6" />
                            MULTIVARIATE PROFILE
                        </h2>
                    </GlossaryTerm>
                    <p className="text-[10px] text-yellow-500 uppercase tracking-widest font-black mt-1">
                        {selectedState?.toUpperCase() || "ALL INDIA"}
                    </p>
                </div>

                {/* State Label removed */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 glass-panel p-8 rounded-3xl min-h-[500px] flex flex-col justify-center bg-gradient-to-b from-gray-900/50 to-black">
                    <div className="flex-1 w-full h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name={selectedState || "All India"}
                                    dataKey="A"
                                    stroke="#f97316"
                                    fill="#f97316"
                                    fillOpacity={0.6}
                                    animationDuration={1500}
                                />
                                <Radar
                                    name="National Average"
                                    dataKey="B"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.2}
                                    animationDuration={1500}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0c0c0c', border: '1px solid #333', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { icon: Users, label: "Child Saturation", color: "text-blue-400", desc: "Percentage of new enrollments targeting 0-5 and 5-18 age groups." },
                        { icon: Zap, label: "Biometric Duty", color: "text-orange-400", desc: "Intensity of mandatory biometric updates relative to total activity." },
                        { icon: TrendingUp, label: "Enrol Momentum", color: "text-green-400", desc: "Rate of new enrollments vs existing card maintenance." },
                        { icon: Target, label: "Traffic Volume", color: "text-purple-400", desc: "Total transaction weight normalized across national operations." },
                        { icon: ShieldAlert, label: "Anomaly Index", color: "text-red-400", desc: "Statistical deviation from expected regional patterns." }
                    ].map((item, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800/50 hover:bg-gray-800/60 transition-all group">
                            <div className="flex items-center gap-3 mb-2">
                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                <GlossaryTerm term={item.label} lang={lang}>
                                    <h4 className="text-[10px] font-black uppercase text-white tracking-widest">{item.label}</h4>
                                </GlossaryTerm>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-relaxed font-medium group-hover:text-gray-400">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IntersectionExplorer;
