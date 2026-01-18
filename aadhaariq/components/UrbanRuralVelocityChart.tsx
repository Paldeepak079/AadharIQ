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

const UrbanRuralVelocityChart: React.FC = () => {
    const [fullData, setFullData] = useState<UrbanRuralFullData | null>(null);
    const [selectedState, setSelectedState] = useState<string>('All India');
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [summary, setSummary] = useState<VelocityData['summary'] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/assets/urban_rural_velocity.json');
                const rawData: UrbanRuralFullData = await response.json();
                setFullData(rawData);

                // Initialize with All India data
                processStateData(rawData.allIndia);
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

        // Convert to array and sort by date
        const chartData = Array.from(dateMap.values()).sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setData(chartData);
        setSummary(stateData.summary);
    };

    const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const state = event.target.value;
        setSelectedState(state);

        if (!fullData) return;

        if (state === 'All India') {
            processStateData(fullData.allIndia);
        } else {
            processStateData(fullData.states[state]);
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
                        {new Date(label).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
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
        <div className="glass-panel p-8 rounded-3xl">
            {/* Header with State Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-orange-500 w-6 h-6" />
                    <div>
                        <h3 className="text-xl font-bold devanagari-header">Urban vs Rural Velocity</h3>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">
                            Authentic enrollment trends across geography types
                        </p>
                    </div>
                </div>

                {/* State Selector */}
                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest">State:</label>
                    <select
                        value={selectedState}
                        onChange={handleStateChange}
                        className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-sm font-bold hover:border-orange-500 transition-colors cursor-pointer focus:outline-none focus:border-orange-500"
                    >
                        <option value="All India">All India</option>
                        {fullData?.stateList.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-blue-500 transition-all cursor-default">
                        <div className="text-blue-400 text-xs mb-1 font-bold">
                            🏢 Urban Total
                        </div>
                        <div className="text-white text-2xl font-bold">
                            {formatNumber(summary.totalUrban)}
                        </div>
                    </div>

                    <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-green-500 transition-all cursor-default">
                        <div className="text-green-400 text-xs mb-1 font-bold">
                            🌾 Rural Total
                        </div>
                        <div className="text-white text-2xl font-bold">
                            {formatNumber(summary.totalRural)}
                        </div>
                    </div>

                    <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-orange-500 transition-all cursor-default">
                        <div className="text-orange-400 text-xs mb-1 font-bold">
                            📊 Rural Dominance
                        </div>
                        <div className="text-white text-2xl font-bold">
                            {((summary.totalRural / (summary.totalUrban + summary.totalRural)) * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            fontSize={10}
                            tickFormatter={(value) => {
                                try {
                                    const date = new Date(value);
                                    if (isNaN(date.getTime())) return '';
                                    return `${date.getMonth() + 1}/${date.getDate()}`;
                                } catch {
                                    return '';
                                }
                            }}
                        />
                        <YAxis
                            stroke="#666"
                            fontSize={10}
                            tickFormatter={formatNumber}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{
                                paddingTop: '20px',
                                fontSize: '13px',
                                color: '#94a3b8'
                            }}
                            iconType="circle"
                        />
                        <Area
                            type="monotone"
                            dataKey="urban"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#urbanGradient)"
                            name="Urban"
                            animationDuration={1500}
                        />
                        <Area
                            type="monotone"
                            dataKey="rural"
                            stroke="#22c55e"
                            strokeWidth={2}
                            fill="url(#ruralGradient)"
                            name="Rural"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Insights */}
            <div className="mt-6 p-4 bg-gray-900/50 border border-gray-800 rounded-2xl">
                <div className="flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                        <div className="text-orange-400 text-xs font-bold mb-1">
                            Key Insight - {selectedState}
                        </div>
                        <div className="text-gray-400 text-xs leading-relaxed">
                            {selectedState === 'All India' ? (
                                <>
                                    Rural areas account for <strong className="text-white">
                                        {summary ? ((summary.totalRural / (summary.totalUrban + summary.totalRural)) * 100).toFixed(1) : 0}%
                                    </strong> of total enrollments, reflecting India's authentic demographic distribution where{' '}
                                    <strong className="text-white">Branch Offices (BO)</strong> serve rural populations.
                                </>
                            ) : (
                                <>
                                    In <strong className="text-white">{selectedState}</strong>, rural areas represent{' '}
                                    <strong className="text-white">
                                        {summary ? ((summary.totalRural / (summary.totalUrban + summary.totalRural)) * 100).toFixed(1) : 0}%
                                    </strong> of enrollments, with <strong className="text-white">{formatNumber(summary?.totalRural || 0)}</strong> rural vs{' '}
                                    <strong className="text-white">{formatNumber(summary?.totalUrban || 0)}</strong> urban enrollments.
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UrbanRuralVelocityChart;
