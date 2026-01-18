
// Centralized API configuration for AadhaarIQ
// This ensures we can switch between local development and production backends easily.

// Use the environment variable VITE_API_URL if it exists, otherwise fallback to localhost
export const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8001';

console.log(`[API SERVICE] Using Base URL: ${API_BASE_URL}`);

/**
 * Common API endpoints
 */
export const ENDPOINTS = {
    STATES: `${API_BASE_URL}/api/states`,
    FORECAST: `${API_BASE_URL}/api/ml/forecast`,
    PULSE: `${API_BASE_URL}/api/ml/pulse`,
    CLUSTERS: `${API_BASE_URL}/api/ml/clusters`,
    SATURATION: `${API_BASE_URL}/api/ml/saturation`,
    RURAL_URBAN: `${API_BASE_URL}/api/ml/rural-urban`,
    RECOMMENDATIONS: `${API_BASE_URL}/api/recommendations`
};
