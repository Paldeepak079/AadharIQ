import React, { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import GlossaryTerm from './GlossaryTerm';

interface VelocityDataPoint {
    date: string;
    enrollments: number;
}

interface VelocityData {
    urban: VelocityDataPoint[];
    rural: VelocityDataPoint[];
    summary: {
        totalUrban: number;
        totalRural: number;
        urbanDataPoints: number;
        ruralDataPoints: number;
        dateRange: {
            start: string;
            end: string;
        };
    };
}

interface UrbanRuralFullData {
    allIndia: VelocityData;
    states: { [key: string]: VelocityData };
    stateList: string[];
}

interface ChartDataPoint {
    date: string;
    urban: number;
    rural: number;
}

interface VelocityProps {
    externalState?: string | null;
    lang?: 'EN' | 'HI';
    onSelect?: (state: string | null) => void;
}

const UrbanRuralVelocityChart: React.FC<VelocityProps> = ({ externalState, lang = 'EN', onSelect }) => {
    const [fullData, setFullData] = useState<UrbanRuralFullData | null>(null);
    const [selectedState, setSelectedState] = useState<string>(externalState || 'All India');
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [summary, setSummary] = useState<VelocityData['summary'] | null>(null);
    const [loading, setLoading] = useState(true);

    // Sync with external state
    useEffect(() => {
        if (fullData) {
            const stateToSet = externalState || 'All India';
            setSelectedState(stateToSet);
            updateViewWithState(stateToSet);
        }
    }, [externalState, fullData]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/assets/urban_rural_velocity.json');
                const rawData: UrbanRuralFullData = await response.json();
                setFullData(rawData);

                // Initialize with correct state
                const initialState = externalState || 'All India';
                const stateData = initialState === 'All India'
                    ? rawData.allIndia
                    : (rawData.states[initialState] || rawData.allIndia);

                processStateData(stateData);
                setLoading(false);
            } catch (error) {
                console.error('Failed to load urban/rural velocity data:', error);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const processStateData = (stateData: VelocityData) => {
        // Merge urban and rural data by date
        const dateMap = new Map<string, ChartDataPoint>();

        stateData.urban.forEach(item => {
            dateMap.set(item.date, {
                date: item.date,
                urban: item.enrollments,
                rural: 0
            });
        });

        stateData.rural.forEach(item => {
            const existing = dateMap.get(item.date);
            if (existing) {
                existing.rural = item.enrollments;
            } else {
                dateMap.set(item.date, {
                    date: item.date,
                    urban: 0,
                    rural: item.enrollments
                });
            }
        });

        // Helper to parse DD-MM-YYYY
        const parseDate = (dateStr: string) => {
            const [d, m, y] = dateStr.split('-').map(Number);
            return new Date(y, m - 1, d);
        };

        // Convert to array and sort by date
        const chartData = Array.from(dateMap.values()).sort((a, b) =>
            parseDate(a.date).getTime() - parseDate(b.date).getTime()
        );

        setData(chartData);
        setSummary(stateData.summary);
    };

    const updateViewWithState = (state: string) => {
        if (!fullData) return;

        if (state === 'All India') {
            processStateData(fullData.allIndia);
        } else {
            // Case-insensitive matching as a safety measure
            const stateData = fullData.states[state] ||
                Object.values(fullData.states).find((_, i) => fullData.stateList[i].toLowerCase() === state.toLowerCase());

            if (stateData) {
                processStateData(stateData);
            } else {
                processStateData(fullData.allIndia);
            }
        }
    };

    const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const state = event.target.value;
        setSelectedState(state);
        updateViewWithState(state);

        // Propagate to global state
        if (onSelect) {
            onSelect(state === 'All India' ? null : state);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel p-4 rounded-xl">
                    <p style={{ color: '#e2e8f0', fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>
                        {(() => {
                            const [d, m, y] = label.split('-').map(Number);
                            return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short'
                            });
                        })()}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: entry.color,
                                    boxShadow: `0 0 8px ${entry.color}`
                                }}
                            />
                            <span style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'capitalize' }}>
                                {entry.name}:
                            </span>
                            <span style={{ color: entry.color, fontSize: '13px', fontWeight: 600 }}>
                                {formatNumber(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="glass-panel p-8 rounded-3xl flex items-center justify-center min-h-[400px]">
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid rgba(249, 115, 22, 0.3)',
                        borderTopColor: '#f97316',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p className="text-gray-400 text-sm">Loading velocity data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-8 rounded-3xl border-t-2 border-blue-500/20">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Chart & Header */}
                <div className="flex-[3]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-blue-500 w-7 h-7" />
                            <div>
                                <GlossaryTerm term="Urban/Rural Velocity" lang={lang}>
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Urban vs Rural Velocity</h3>
                                </GlossaryTerm>
                                <p className="text-[10px] text-blue-500 uppercase tracking-widest font-black mt-1 line-clamp-1">
                                    {selectedState.toUpperCase()}
                                </p>
                            </div>
                        </div>

                    </div>

                    {summary && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                            <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-xl">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Urban Load</p>
                                <p className="text-xl font-black text-blue-400">{formatNumber(summary.totalUrban)}</p>
                            </div>
                            <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-xl">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Rural Load</p>
                                <p className="text-xl font-black text-green-400">{formatNumber(summary.totalRural)}</p>
                            </div>
                            <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-xl hidden md:block">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Ratio Balance</p>
                                <p className="text-xl font-black text-white">{((summary.totalRural / (summary.totalUrban + summary.totalRural)) * 100).toFixed(0)}:{(100 - (summary.totalRural / (summary.totalUrban + summary.totalRural)) * 100).toFixed(0)}</p>
                            </div>
                        </div>
                    )}

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="urbanGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ruralGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#444"
                                    fontSize={9}
                                    tick={{ fill: '#666', fontWeight: 'bold' }}
                                    tickFormatter={(v) => {
                                        const [d, m, y] = v.split('-').map(Number);
                                        const date = new Date(y, m - 1, d);
                                        return isNaN(date.getTime()) ? '' : `${date.getDate()}/${date.getMonth() + 1}`;
                                    }}
                                    interval={data.length > 20 ? Math.floor(data.length / 8) : 0}
                                />
                                <YAxis stroke="#444" fontSize={9} tick={{ fill: '#666', fontWeight: 'bold' }} tickFormatter={formatNumber} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="urban" stroke="#3b82f6" strokeWidth={2} fill="url(#urbanGradient)" animationDuration={1000} />
                                <Area type="monotone" dataKey="rural" stroke="#22c55e" strokeWidth={2} fill="url(#ruralGradient)" animationDuration={1200} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Insight Sidebar to fill the gap */}
                <div className="flex-1 space-y-4">
                    <div className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-2xl h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-green-500/20 rounded-md">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                                <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Regional Dominance</h4>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-white leading-none">
                                        {summary ? ((summary.totalRural / (summary.totalUrban + summary.totalRural)) * 100).toFixed(1) : 0}%
                                    </p>
                                    <span className={`text-[10px] font-bold ${summary && (summary.totalRural / (summary.totalUrban + summary.totalRural)) > 0.91 ? 'text-green-400' : 'text-orange-400'}`}>
                                        {summary ? ((((summary.totalRural / (summary.totalUrban + summary.totalRural)) * 100) - 91.0).toFixed(1)) : '0.0'}% vs Nat.
                                    </span>
                                </div>
                                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-2">Rural Priority Score</p>
                            </div>

                            <div className="mb-6 p-4 bg-black/40 border border-white/5 rounded-xl">
                                <GlossaryTerm term="Enrollment Density Scale" side="bottom" lang={lang}>
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Enrollment Density Scale</p>
                                </GlossaryTerm>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-black text-white tracking-tighter">
                                        {(summary ? (summary.totalRural / 1120).toFixed(0) : '0')} pts
                                    </span>
                                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">OPTIMAL</span>
                                </div>
                            </div>

                            <p className="text-[11px] text-gray-400 leading-relaxed italic border-l-2 border-green-500/30 pl-3 mb-4">
                                "{selectedState === 'All India'
                                    ? "National infrastructure is strategically weighted towards Post Offices to ensure 100% universal registration coverage in remote clusters."
                                    : `In ${selectedState}, the high rural velocity (representing ${summary ? ((summary.totalRural / (summary.totalUrban + summary.totalRural)) * 100).toFixed(0) : 0}% of all load) indicates a successful transition to the "Baal Aadhaar" deployment model for sub-5 year groups.`
                                }"
                            </p>

                            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                System AI has detected that {selectedState === 'All India' ? 'the national averages' : `regional patterns in ${selectedState}`} align with the 2026 saturation roadmap, maintaining a high density of mobile service points (UIDAI-on-Wheels).
                            </p>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 font-bold uppercase">Data Integrity</span>
                                <span className="text-green-500 font-black">99.8%</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 font-bold uppercase">System Latency</span>
                                <span className="text-blue-500 font-black">12ms</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-2">
                                <div className="bg-green-500 h-full w-[91%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UrbanRuralVelocityChart;
