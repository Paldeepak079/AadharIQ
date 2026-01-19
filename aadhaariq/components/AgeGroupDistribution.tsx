import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users } from 'lucide-react';
import { INDIA_STATES_DATA } from '../data/realData';
import { Language } from '../types';
import GlossaryTerm from './GlossaryTerm';

interface AgeGroupData {
    name: string;
    value: number;
    color: string;
}

interface AgeGroupProps {
    externalState?: string | null;
    lang?: Language;
}

const AgeGroupDistribution: React.FC<AgeGroupProps> = ({ externalState, lang = 'EN' }) => {
    const [selectedState, setSelectedState] = useState<string>(externalState || 'All India');
    const [chartData, setChartData] = useState<AgeGroupData[]>([]);
    const [totalEnrollments, setTotalEnrollments] = useState<number>(0);

    // Sync with external state
    useEffect(() => {
        setSelectedState(externalState || 'All India');
    }, [externalState]);

    // Get unique state list from authentic data
    const stateList = Array.from(new Set(INDIA_STATES_DATA.map(s => s.state))).sort();

    useEffect(() => {
        calculateAgeDistribution(selectedState);
    }, [selectedState]);

    const calculateAgeDistribution = (state: string) => {
        let data;

        if (state === 'All India') {
            // Aggregate all states
            data = INDIA_STATES_DATA;
        } else {
            // Filter for specific state
            data = INDIA_STATES_DATA.filter(s => s.state === state);
        }

        // Calculate totals for each age group from authentic data
        const age_0_5 = data.reduce((acc, s) => acc + (s.enrolment_0_5 || 0), 0);
        const age_5_17 = data.reduce((acc, s) => acc + (s.enrolment_5_17 || 0), 0);
        const age_18_plus = data.reduce((acc, s) => acc + (s.enrolment_18_plus || 0), 0);

        const total = age_0_5 + age_5_17 + age_18_plus;
        setTotalEnrollments(total);

        setChartData([
            {
                name: '0-5',
                value: age_0_5,
                color: '#138808'
            },
            {
                name: '5-18',
                value: age_5_17,
                color: '#FF9933'
            },
            {
                name: '18+',
                value: age_18_plus,
                color: '#3b82f6'
            }
        ]);
    };

    const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedState(event.target.value);
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = totalEnrollments > 0
                ? ((data.value / totalEnrollments) * 100).toFixed(1)
                : '0.0';

            return (
                <div className="glass-panel p-4 rounded-xl">
                    <p className="text-white text-sm font-bold mb-2">{data.name} Years</p>
                    <p className="text-gray-400 text-xs">
                        Enrollments: <span className="text-white font-bold">{formatNumber(data.value)}</span>
                    </p>
                    <p className="text-gray-400 text-xs">
                        Share: <span className="text-white font-bold">{percentage}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-panel p-6 rounded-3xl bg-black/40 border border-gray-800">
            {/* Header with State Selector */}
            <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <Users className="text-orange-500 w-5 h-5" />
                    <div>
                        <p className="text-white text-sm font-bold">Age Group Distribution</p>
                        <p className="text-[10px] text-gray-500 uppercase mt-1">Based on Real Enrolment Data</p>
                    </div>
                </div>

                {/* State Selector - FIXED */}
                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">State:</label>
                    <select
                        value={selectedState}
                        onChange={handleStateChange}
                        className="w-full px-3 py-1.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white text-xs font-bold hover:border-orange-500 transition-colors cursor-pointer focus:outline-none focus:border-orange-500"
                        style={{
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}
                    >
                        <option value="All India">All India</option>
                        {stateList.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[200px] w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis
                            dataKey="name"
                            stroke="#666"
                            fontSize={11}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#666"
                            fontSize={10}
                            tickFormatter={formatNumber}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {chartData.map((group, idx) => {
                    const percentage = totalEnrollments > 0
                        ? ((group.value / totalEnrollments) * 100).toFixed(1)
                        : '0.0';

                    return (
                        <div key={idx} className="p-3 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-orange-500 transition-all cursor-default">
                            <GlossaryTerm term={group.name.includes('-') ? `Child (0-5)` : group.name.includes('+') ? `Adults (18+)` : `Youth (5-17)`} lang={lang}>
                                <div className="text-[10px] text-gray-400 mb-1 font-bold">{group.name} yrs</div>
                            </GlossaryTerm>
                            <div className="text-white text-lg font-bold">{formatNumber(group.value)}</div>
                            <div className="text-xs font-bold mt-1" style={{ color: group.color }}>
                                {percentage}%
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <p className="text-[9px] text-gray-600 text-center leading-relaxed">
                Distribution reflects{' '}
                <span className="text-green-500 font-bold">Child (0-5)</span>,{' '}
                <span className="text-orange-500 font-bold">Youth (5-18)</span>, and{' '}
                <span className="text-blue-500 font-bold">Adult (18+)</span> registration volume
                {selectedState !== 'All India' && (
                    <> for <span className="text-white font-bold">{selectedState}</span></>
                )}
            </p>
        </div>
    );
};

export default AgeGroupDistribution;
