
import React, { useMemo } from 'react';
import { Shield, MapPin, Zap, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { INDIA_STATES_DATA } from '../data/realData';

interface PolicyActionMapperProps {
    selectedState: string | null;
    saturationData: any[]; // Data from /api/ml/saturation
}

interface ActionCard {
    title: string;
    type: 'CRITICAL' | 'STABLE' | 'GROWTH';
    icon: any;
    recommendation: string;
    impact: string;
}

const PolicyActionMapper: React.FC<PolicyActionMapperProps> = ({ selectedState, saturationData }) => {
    const actions = useMemo(() => {
        const rawStateData = selectedState ? INDIA_STATES_DATA.find(s => s.state === selectedState) : null;
        const satStateData = selectedState ? saturationData.find(s => s.state.toLowerCase() === selectedState.toLowerCase()) : null;

        const list: ActionCard[] = [];

        // 1. Saturation Gap Action
        if (satStateData && satStateData.gap > 8) {
            list.push({
                title: "Saturation Parity Campaign",
                type: 'CRITICAL',
                icon: MapPin,
                recommendation: `Deploy mobile enrollment units to high-gap districts. Current gap is ${satStateData.gap.toFixed(1)}%.`,
                impact: "Est. +1.2% enrollment growth within 90 days."
            });
        } else if (satStateData) {
            list.push({
                title: "Saturation Maintenance",
                type: 'STABLE',
                icon: CheckCircle2,
                recommendation: "Shift focus from new enrollment to specialized update services (Biometric updates 10y+).",
                impact: "Optimizes infrastructure for lifetime authentication quality."
            });
        }

        // 2. Anomaly/Authentication Action
        if (rawStateData && rawStateData.anomalyScore > 0.65) {
            list.push({
                title: "Anomaly Investigation",
                type: 'CRITICAL',
                icon: AlertTriangle,
                recommendation: "Perform deep-dive audit on enrollment centers showing high update volatility.",
                impact: "Improves data integrity and prevents potential identity fraud."
            });
        }

        // 3. Child Enrollment Action
        if (rawStateData && (rawStateData.childEnrolments / rawStateData.enrolments) < 0.4) {
            list.push({
                title: "Anganwadi Outreach",
                type: 'GROWTH',
                icon: Zap,
                recommendation: "Incentivize enrollment at child-care centers to close the youth coverage gap.",
                impact: "Secures long-term identity lifecycle for the next-gen population."
            });
        }

        // 4. Update Strategy
        if (rawStateData && rawStateData.updates > 1000000) {
            list.push({
                title: "Update Capacity Scaling",
                type: 'STABLE',
                icon: TrendingUp,
                recommendation: "Increase server bandwidth for peak update hours to reduce authentication latency.",
                impact: "Reduces user wait-time and increases citizen satisfaction."
            });
        }

        return list.slice(0, 3); // Top 3 actions
    }, [selectedState, saturationData]);

    if (!selectedState || selectedState === "All India") {
        return (
            <div className="glass-panel p-8 rounded-3xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center text-center">
                <Shield className="w-12 h-12 text-gray-700 mb-4" />
                <p className="text-gray-500 max-w-xs uppercase tracking-widest text-[10px] font-black">
                    Select a specific state to generate deterministic policy action mapping
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter">Strategic Intervention Map</h3>
                <span className="px-2 py-0.5 bg-orange-600/20 text-orange-400 text-[8px] font-black rounded border border-orange-500/30 uppercase tracking-widest">
                    {selectedState}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actions.map((action, i) => (
                    <div key={i} className={`p-5 rounded-2xl border transition-all ${action.type === 'CRITICAL' ? 'bg-red-950/20 border-red-500/30' :
                            action.type === 'GROWTH' ? 'bg-green-950/20 border-green-500/30' :
                                'bg-blue-950/20 border-blue-500/30'
                        }`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${action.type === 'CRITICAL' ? 'bg-red-500 text-white' :
                                    action.type === 'GROWTH' ? 'bg-green-500 text-white' :
                                        'bg-blue-500 text-white'
                                }`}>
                                <action.icon className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-sm text-white">{action.title}</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-3">
                            {action.recommendation}
                        </p>
                        <div className="pt-3 border-t border-white/5">
                            <p className="text-[10px] font-black uppercase text-gray-500">Projected Impact</p>
                            <p className="text-[10px] text-green-400 font-bold">{action.impact}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PolicyActionMapper;
