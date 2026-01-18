
import { AadhaarData, ForecastPoint } from '../types';

export const INDIA_STATES_DATA: AadhaarData[] = [
  { state: "Uttar Pradesh", enrolments: 220000000, updates: 45000000, childEnrolments: 12000000, genderRatio: 1.05, anomalyScore: 0.1, cluster: 1, ruralRatio: 78, urbanRatio: 22 },
  { state: "Maharashtra", enrolments: 120000000, updates: 32000000, childEnrolments: 5000000, genderRatio: 1.02, anomalyScore: 0.05, cluster: 1, ruralRatio: 55, urbanRatio: 45 },
  { state: "Bihar", enrolments: 110000000, updates: 18000000, childEnrolments: 9500000, genderRatio: 1.08, anomalyScore: 0.35, cluster: 2, ruralRatio: 89, urbanRatio: 11 },
  { state: "West Bengal", enrolments: 98000000, updates: 21000000, childEnrolments: 4200000, genderRatio: 1.01, anomalyScore: 0.15, cluster: 1, ruralRatio: 68, urbanRatio: 32 },
  { state: "Jharkhand", enrolments: 38000000, updates: 9000000, childEnrolments: 3100000, genderRatio: 1.04, anomalyScore: 0.82, cluster: 3, ruralRatio: 76, urbanRatio: 24 },
  { state: "Karnataka", enrolments: 68000000, updates: 15000000, childEnrolments: 2800000, genderRatio: 0.99, anomalyScore: 0.08, cluster: 1, ruralRatio: 61, urbanRatio: 39 },
  { state: "Tamil Nadu", enrolments: 76000000, updates: 17000000, childEnrolments: 2900000, genderRatio: 0.98, anomalyScore: 0.04, cluster: 1, ruralRatio: 52, urbanRatio: 48 },
  { state: "Kerala", enrolments: 35000000, updates: 8000000, childEnrolments: 1200000, genderRatio: 0.96, anomalyScore: 0.02, cluster: 1, ruralRatio: 48, urbanRatio: 52 },
  { state: "Gujarat", enrolments: 65000000, updates: 14000000, childEnrolments: 2500000, genderRatio: 1.07, anomalyScore: 0.12, cluster: 1, ruralRatio: 57, urbanRatio: 43 },
];

export const FORECAST_DATA: ForecastPoint[] = [
  { date: '2023-01', actual: 4000, predicted: 4100 },
  { date: '2023-02', actual: 4200, predicted: 4250 },
  { date: '2023-03', actual: 4500, predicted: 4400 },
  { date: '2023-04', actual: 4300, predicted: 4350 },
  { date: '2023-05', actual: 4700, predicted: 4600 },
  { date: '2023-06', actual: 4900, predicted: 4850 },
  { date: '2023-07', predicted: 5100 },
  { date: '2023-08', predicted: 5300 },
  { date: '2023-09', predicted: 5500 },
  { date: '2023-10', predicted: 5800 },
];

export const ANOMALIES = [
  { id: '1', title: 'Biometric Surge', region: 'Jharkhand', description: 'Unexpected 31% surge in biometric updates across tribal districts, suggesting effective community outreach.', type: 'SOCIETAL' },
  { id: '2', title: 'Urban Transition', region: 'Maharashtra', description: 'High volume of address updates in peripheral urban regions indicates rapid rural-to-urban migration.', type: 'SOCIETAL' },
  { id: '3', title: 'Gender Gap Spike', region: 'Bihar', description: 'Female enrolment lag identified in northern districts; intervention required.', type: 'ANOMALY' },
];
