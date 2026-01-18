
export type Language = 'EN' | 'HI';

export interface AadhaarData {
  state: string;
  enrolments: number;
  updates: number;
  childEnrolments: number;
  genderRatio: number; // M:F
  anomalyScore: number;
  cluster: number;
  ruralRatio: number; // Percentage of rural enrolment
  urbanRatio: number; // Percentage of urban enrolment
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'ANOMALY' | 'FORECAST' | 'GENERAL' | 'SOCIETAL';
  region: string;
}

export interface ForecastPoint {
  date: string;
  actual?: number;
  predicted: number;
}

export interface AppState {
  lang: Language;
  selectedState: string | null;
  loading: boolean;
}
