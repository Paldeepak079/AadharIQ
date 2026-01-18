// Import processed real Aadhaar data
import processedData from './aadhaar_data.json';

export interface AadhaarStateData {
    state: string;
    enrolments: number;
    updates: number;
    childEnrolments: number;
    enrolment_0_5?: number;
    enrolment_5_17?: number;
    enrolment_18_plus?: number;
    biometricUpdates: number;
    demographicUpdates: number;
    ruralRatio?: number | null;
    urbanRatio?: number | null;
}

export interface AadhaarDistrictData {
    state: string;
    district: string;
    enrolments: number;
    lat: number;
    lng: number;
}

export interface AadhaarTimeSeries {
    date: string;
    enrolments: number;
}

export interface AadhaarSummary {
    totalEnrolments: number;
    totalUpdates: number;
    totalChildEnrolments: number;
    totalBiometricUpdates: number;
    totalDemographicUpdates: number;
    totalStates: number;
    totalDistricts: number;
    lastUpdated: string;
}

export interface AadhaarDataSet {
    summary: AadhaarSummary;
    states: AadhaarStateData[];
    districts: AadhaarDistrictData[];
    timeSeries: AadhaarTimeSeries[];
}

// Export real data
export const REAL_AADHAAR_DATA: AadhaarDataSet = processedData as AadhaarDataSet;

// Export state data (backward compatible with existing components)
// Add computed anomalyScore based on update ratio and enrolment velocity
// Add computed anomalyScore based on update ratio and enrolment velocity
const uniqueStatesMap = new Map();
REAL_AADHAAR_DATA.states.forEach(state => {
    // Normalize state name to handle case sensitivity or duplicates
    const normalizedName = state.state.trim();
    if (!uniqueStatesMap.has(normalizedName)) {
        uniqueStatesMap.set(normalizedName, state);
    }
});

// Calculate national baseline for "Normal" behavior
const totalEnrolments = Array.from(uniqueStatesMap.values()).reduce((acc: number, s: any) => acc + s.enrolments, 0);
const totalUpdates = Array.from(uniqueStatesMap.values()).reduce((acc: number, s: any) => acc + s.updates, 0);
const nationalUpdateRatio = totalUpdates / Math.max(totalEnrolments, 1); // Avg ~20 updates per enrolment

export const INDIA_STATES_DATA: (AadhaarStateData & { anomalyScore: number })[] =
    Array.from(uniqueStatesMap.values()).map((state: any) => {
        const stateRatio = state.updates / Math.max(state.enrolments, 1000); // normalized ratio

        // Anomaly is defined as significant deviation from national average
        // If state ratio is close to national ratio (e.g. 20), anomaly is low.
        // If state ratio is 5x higher or lower, anomaly is high.

        const deviation = Math.abs(stateRatio - nationalUpdateRatio);
        const percentDeviation = deviation / nationalUpdateRatio;

        // Sigmoid-like clamping: >200% deviation = 100% anomaly
        const score = Math.min(percentDeviation / 2, 1);

        return {
            ...state,
            anomalyScore: score
        };
    });

// Export district data for map
export const DISTRICT_DATA: AadhaarDistrictData[] = REAL_AADHAAR_DATA.districts;

// Export time series data
export const TIME_SERIES_DATA: AadhaarTimeSeries[] = REAL_AADHAAR_DATA.timeSeries;

// Export summary statistics
export const DATA_SUMMARY: AadhaarSummary = REAL_AADHAAR_DATA.summary;

// Utility functions
export const getStateData = (stateName: string): AadhaarStateData | undefined => {
    return INDIA_STATES_DATA.find(s =>
        s.state.toLowerCase().includes(stateName.toLowerCase())
    );
};

export const getDistrictsByState = (stateName: string): AadhaarDistrictData[] => {
    return DISTRICT_DATA.filter(d =>
        d.state.toLowerCase().includes(stateName.toLowerCase())
    );
};

export const getTotalEnrolments = (): number => {
    return DATA_SUMMARY.totalEnrolments;
};

export const getTotalUpdates = (): number => {
    return DATA_SUMMARY.totalBiometricUpdates + DATA_SUMMARY.totalDemographicUpdates;
};

export const getTopStates = (count: number = 10): AadhaarStateData[] => {
    return [...INDIA_STATES_DATA]
        .sort((a, b) => b.enrolments - a.enrolments)
        .slice(0, count);
};
