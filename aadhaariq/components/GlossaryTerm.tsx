import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

export const GLOSSARY: Record<string, { EN: string; HI: string }> = {
    'Anomaly Score': {
        EN: 'Statistical measure (0-100%) indicating how much regional data deviates from normal national patterns.',
        HI: 'सांख्यिकीय माप (0-100%) जो दर्शाता है कि क्षेत्रीय डेटा सामान्य राष्ट्रीय पैटर्न से कितना अलग है।'
    },
    'Update Velocity': {
        EN: 'Speed of Aadhaar record updates, identifying high-load infrastructure periods.',
        HI: 'आधार रिकॉर्ड अपडेट की गति, उच्च-लोड बुनियादी ढांचा अवधियों की पहचान करना।'
    },
    'Child Ratio': {
        EN: '% of new enrollments from 0-18 age groups vs total regional activity.',
        HI: 'कुल क्षेत्रीय गतिविधि बनाम 0-18 आयु वर्ग के नए नामांकन का प्रतिशत।'
    },
    'Peak Demand Stage': {
        EN: 'Intensity classification (e.g., Extreme Surge) based on current growth momentum.',
        HI: 'वर्तमान विकास गति के आधार पर तीव्रता वर्गीकरण (जैसे, अत्यधिक वृद्धि)।'
    },
    'Forecast Integrity': {
        EN: 'Statistical confidence level of our AI engine\'s regional predictions.',
        HI: 'हमारे एआई इंजन की क्षेत्रीय भविष्यवाणियों का सांख्यिकीय विश्वास स्तर।'
    },
    'Sample Density': {
        EN: 'Granularity and richness of historical data used for predictive modeling.',
        HI: 'प्रिडिक्टिव मॉडलिंग के लिए उपयोग किए गए ऐतिहासिक डेटा की विस्तृतता और समृद्धि।'
    },

    'Biometric Duty': {
        EN: 'Intensity of mandatory biometric updates relative to total operational volume.',
        HI: 'कुल परिचालन मात्रा के सापेक्ष वैधानिक बायोमेट्रिक अपडेट की तीव्रता।'
    },
    'Enrol Momentum': {
        EN: 'Speed of new enrollment acquisition compared to existing card maintenance.',
        HI: 'मौजूदा कार्ड रखरखाव की तुलना में नए नामांकन अधिग्रहण की गति।'
    },
    'Traffic Volume': {
        EN: 'Total aggregate transactions (Enrollments + Updates) normalized across India.',
        HI: 'पूरे भारत में सामान्यीकृत कुल संचयी लेनदेन (नामांकन + अपडेट)।'
    },
    'Momentum Shift': {
        EN: 'Sudden acceleration or deceleration in regional activity compared to historical trends.',
        HI: 'ऐतिहासिक रुझानों की तुलना में क्षेत्रीय गतिविधि में अचानक तेजी या मंदी।'
    },
    'Urban/Rural Velocity': {
        EN: 'Comparative growth rates of service points in city vs village environments.',
        HI: 'शहर बनाम ग्रामीण वातावरण में सेवा केंद्रों की तुलनात्मक विकास दर।'
    },
    'Saturation Shield': {
        EN: 'Protection level against identity gaps in adult population segments.',
        HI: 'वयस्क जनसंख्या समूहों में पहचान अंतराल के खिलाफ सुरक्षा स्तर।'
    },
    'Targeted Growth': {
        EN: 'Focus on specific demographics (like children) to reach 100% coverage.',
        HI: '100% कवरेज प्राप्त करने के लिए विशिष्ट जनसांख्यिकी (जैसे बच्चों) पर ध्यान केंद्रित करना।'
    },
    'Update Friction': {
        EN: 'Measure of technical or logistical difficulty in processing Aadhaar updates.',
        HI: 'आधार अपडेट को संसाधित करने में तकनीकी या तार्किक कठिनाई का माप।'
    },
    'Strategic Surplus': {
        EN: 'Available operational bandwidth and capacity for future spikes.',
        HI: 'भविष्य की वृद्धि के लिए उपलब्ध परिचालन बैंडविड्थ और क्षमता।'
    },
    'Anomaly Index': {
        EN: 'Heatmap indicating regions with highest statistical deviations.',
        HI: 'उच्चतम सांख्यिकीय विचलन वाले क्षेत्रों को दर्शाने वाला हीटमैप।'
    },
    'Child Saturation': {
        EN: '% of child population (0-18) registered with Aadhaar in the region.',
        HI: 'क्षेत्र में आधार के साथ पंजीकृत बाल जनसंख्या (0-18) का %।'
    },
    'Societal Impact': {
        EN: 'A qualitative assessment of how Aadhaar coverage improves access to social welfare and financial inclusion.',
        HI: 'आधार कवरेज सामाजिक कल्याण और वित्तीय समावेशन तक पहुंच को कैसे बेहतर बनाता है, इसका गुणात्मक मूल्यांकन।'
    },
    'Biometric Updates': {
        EN: 'Re-validation of fingerprints, iris scans, or face photos to maintain record accuracy.',
        HI: 'रिकॉर्ड की सटीकता बनाए रखने के लिए उंगलियों के निशान, आईरिस स्कैन या चेहरे की तस्वीरों का पुन: सत्यापन।'
    },
    'Total Enrolments': {
        EN: 'Cumulative number of new Aadhaar identities generated in the selected region.',
        HI: 'चयनित क्षेत्र में उत्पन्न नई आधार पहचानों की कुल संचयी संख्या।'
    },
    'Child Enrolment': {
        EN: 'Specific focus on registering citizens under 18 years of age (Baal Aadhaar).',
        HI: '18 वर्ष से कम आयु के नागरिकों (बाल आधार) को पंजीकृत करने पर विशिष्ट ध्यान।'
    },
    'Child (0-5)': {
        EN: 'Enrollment focus for infants and toddlers (Blue Aadhaar / Baal Aadhaar).',
        HI: 'शिशुओं और छोटे बच्चों के लिए नामांकन पर ध्यान (नीला आधार / बाल आधार)।'
    },
    'Youth (5-17)': {
        EN: 'Mandatory biometric updates required for children between 5 and 18 years.',
        HI: '5 से 18 वर्ष के बच्चों के लिए अनिवार्य बायोमेट्रिक अपडेट की आवश्यकता।'
    },
    'Adults (18+)': {
        EN: 'Saturation achieved in adult groups; focus is on maintenance and updates.',
        HI: 'वयस्क समूहों में संतृप्ति प्राप्त; फोकस रखरखाव और अपडेट पर है।'
    },
    'Total Enrolments Trend': {
        EN: 'Monthly growth patterns identifying seasonal peaks in service center traffic.',
        HI: 'सेवा केंद्र ट्रैफ़िक में मौसमी चोटियों की पहचान करने वाले मासिक विकास पैटर्न।'
    },
    'Diagnostic Identification': {
        EN: 'AI-driven analysis to pinpoint statistical outliers in regional Aadhaar activity.',
        HI: 'क्षेत्रीय आधार गतिविधि में सांख्यिकीय विचलनों को इंगित करने के लिए एआई-संचालित विश्लेषण।'
    },
    'National Activity Pulse': {
        EN: 'Real-time monitoring of transaction frequency (Daily/Monthly) to identify operational bottlenecks across India.',
        HI: 'भारत भर में परिचालन संबंधी बाधाओं की पहचान करने के लिए लेनदेन की आवृत्ति (दैनिक/मासिक) की वास्तविक समय की निगरानी।'
    },
    'Multivariate State Profile': {
        EN: 'A high-density technical analysis cross-referencing child saturation, biometric duty, momentum, volume, and anomaly scores.',
        HI: 'बाल संतृप्ति, बायोमेट्रिक ड्यूटी, गति, वॉल्यूम और विसंगति स्कोर को क्रॉस-रेफरेंस करने वाला एक उच्च-घनत्व तकनीकी विश्लेषण।'
    },
    'Strategic Workload Forecasting': {
        EN: 'AI-driven predictive modeling (Holt-Winters) to project future system demand and resource requirements.',
        HI: 'एआई-संचालित प्रिडिक्टिव मॉडलिंग (होल्ट-विंटर्स) भविष्य की सिस्टम मांग और संसाधन आवश्यकताओं को प्रोजेक्ट करने के लिए।'
    },
    'National Saturation Peak': {
        EN: 'The point where birth-rate-aligned enrolments stabilize, shifting focus to lifecycle updates.',
        HI: 'वह बिंदु जहाँ जन्म-दर-संरेखित नामांकन स्थिर हो जाते हैं, जिससे ध्यान जीवनचक्र अपडेट पर स्थानांतरित हो जाता है।'
    },
    'Regional Infrastructure Strain': {
        EN: 'Detection of operational bottlenecks where machine capacity is overwhelmed by local update demand.',
        HI: 'परिचालन संबंधी बाधाओं का पता लगाना जहाँ मशीन की क्षमता स्थानीय अपडेट की मांग से अधिक हो जाती है।'
    },
    'Demographic & Economic Clustering': {
        EN: 'AI grouping of regions based on shared age-mix and economic activity patterns for tailored policy.',
        HI: 'अनुकूलित नीति के लिए साझा आयु-मिश्रण और आर्थिक गतिविधि पैटर्न के आधार पर क्षेत्रों की एआई समूहीकरण।'
    },
    'Saturation Gap': {
        EN: 'The statistical difference between the estimated eligible population and actual Aadhaar holders.',
        HI: 'अनुमानित पात्र जनसंख्या और वास्तविक आधार धारकों के बीच सांख्यिकीय अंतर।'
    },
    'Saturated (<5% Gap)': {
        EN: 'Regions where Aadhaar coverage is nearly universal, with minimal remaining untapped population.',
        HI: 'वे क्षेत्र जहाँ आधार कवरेज लगभग सार्वभौमिक है, जिसमें न्यूनतम शेष अप्रयुक्त जनसंख्या है।'
    },
    'Dark Zone (>10% Gap)': {
        EN: 'Critical priority regions with significant eligible population segments yet to be enrolled.',
        HI: 'महत्वपूर्ण प्राथमिकता वाले क्षेत्र जहाँ पात्र जनसंख्या के बड़े हिस्से का अभी तक नामांकन नहीं हुआ है।'
    },
    'Enrollment Density Scale': {
        EN: 'A measure of enrollment concentration per operational center, normalized for regional population.',
        HI: 'प्रति परिचालन केंद्र नामांकन एकाग्रता का माप, क्षेत्रीय जनसंख्या के लिए सामान्यीकृत।'
    }
};

interface GlossaryProps {
    term: string;
    children: React.ReactNode;
    lang?: 'EN' | 'HI';
    className?: string;
    side?: 'top' | 'bottom';
}

const GlossaryTerm: React.FC<GlossaryProps> = ({ term, children, lang = 'EN', className = "", side = "top" }) => {
    const [isHovered, setIsHovered] = useState(false);
    const item = GLOSSARY[term];
    const definition = item ? (lang === 'HI' ? item.HI : item.EN) : null;

    if (!definition) return <span className={className}>{children}</span>;

    return (
        <span
            className={`relative inline-flex items-center gap-1 cursor-help group transition-all ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className="border-b border-dotted border-gray-500 group-hover:border-orange-500 transition-colors">
                {children}
            </span>
            <Info className="w-3 h-3 text-gray-500 group-hover:text-orange-500 transition-colors opacity-40 group-hover:opacity-100" />

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                        className="absolute z-[100] w-72 p-4 bg-gray-950/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-none left-1/2 bottom-full mb-4"
                        style={{
                            maxWidth: '90vw',
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <div className="relative z-10">
                            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-2">
                                {lang === 'HI' ? 'क्षेत्रीय अवधारणा' : 'Domain Concept'}
                            </span>
                            <span className="block text-xs text-gray-200 leading-relaxed font-semibold">
                                {definition}
                            </span>
                        </div>
                        {/* Caret - Always at bottom since tooltip is always at top */}
                        <div className="absolute top-full -mt-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-950 border-r border-b border-white/20 rotate-45 z-0" />
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};

export default GlossaryTerm;
