
import { GoogleGenerativeAI } from "@google/generative-ai";

// ============ TYPES ============
export type AudienceType = 'policymaker' | 'field_team' | 'citizen' | 'analyst';
export type Language = 'EN' | 'HI';

export interface TrendTag {
  type: 'migration-linked' | 'update-backlog' | 'gender-skew' | 'enrollment-surge' | 'age-anomaly' | 'rural-urban-gap';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

export interface InsightResponse {
  insight: string;
  insightHindi?: string;
  tags: TrendTag[];
  actionableSteps: string[];
  timestamp: number;
  cacheKey: string;
}

// ============ CACHE MANAGEMENT ============
interface CacheEntry {
  data: InsightResponse;
  timestamp: number;
}

const insightCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

function getCachedInsight(cacheKey: string): InsightResponse | null {
  const entry = insightCache.get(cacheKey);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_DURATION_MS;
  if (isExpired) {
    insightCache.delete(cacheKey);
    return null;
  }

  console.log(`[CACHE HIT] Returning cached insight for: ${cacheKey}`);
  return entry.data;
}

function setCachedInsight(cacheKey: string, data: InsightResponse): void {
  insightCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  console.log(`[CACHE SET] Stored insight for: ${cacheKey}`);
}

// ============ AUDIENCE-AWARE PROMPTS ============
const AUDIENCE_TEMPLATES = {
  policymaker: `You are an elite policy consultant for UIDAI (Unique Identification Authority of India).
Your audience is senior policymakers and government decision-makers.
Tone: Formal, authoritative, policy-grade language.
Focus: Social-economic impacts, digital public infrastructure efficiency, political feasibility.
Structure: "Executive Summary", "Societal Trend Analysis", "Identified Anomalies", "Recommended Policy Framework".`,

  field_team: `You are a field operations advisor for UIDAI.
Your audience is district-level field officers and enrollment center coordinators.
Tone: Practical, operational, action-oriented.
Focus: Ground-level implementation, resource allocation, operational bottlenecks.
Structure: "Field Situation", "Operational Issues", "Immediate Actions Required".`,

  citizen: `You are a public-facing Aadhaar information assistant.
Your audience is everyday citizens seeking to understand Aadhaar trends in their region.
Tone: Simple, plain-language, friendly, non-technical.
Focus: What it means for local communities, accessibility, ease of service.
Structure: "What's Happening in Your Area", "Why This Matters", "What You Can Do".`,

  analyst: `You are a data intelligence analyst for UIDAI.
Your audience is data scientists, ML engineers, and strategic planners.
Tone: Technical, data-driven, analytical.
Focus: Statistical patterns, ML model outputs, predictive insights, data quality.
Structure: "Data Overview", "Pattern Detection", "ML Insights", "Recommendations for Model Tuning".`
};

// ============ TREND DETECTION & TAGGING ============
function detectTrends(dataSummary: string, region: string): TrendTag[] {
  const tags: TrendTag[] = [];
  const lowerData = dataSummary.toLowerCase();

  // Migration patterns
  if (lowerData.includes('surge') || lowerData.includes('spike') || lowerData.includes('+')) {
    const percentMatch = dataSummary.match(/\+(\d+)%/);
    const percent = percentMatch ? parseInt(percentMatch[1]) : 0;
    tags.push({
      type: 'migration-linked',
      severity: percent > 40 ? 'high' : percent > 25 ? 'medium' : 'low',
      confidence: 0.75
    });
  }

  // Update backlog
  if (lowerData.includes('backlog') || lowerData.includes('pending') || lowerData.includes('low update')) {
    tags.push({
      type: 'update-backlog',
      severity: 'medium',
      confidence: 0.7
    });
  }

  // Gender imbalance
  if (lowerData.includes('gender') || lowerData.includes('male') || lowerData.includes('female')) {
    tags.push({
      type: 'gender-skew',
      severity: 'medium',
      confidence: 0.65
    });
  }

  // Enrollment surge
  if (lowerData.includes('enrollment') && (lowerData.includes('high') || lowerData.includes('increase'))) {
    tags.push({
      type: 'enrollment-surge',
      severity: 'low',
      confidence: 0.8
    });
  }

  // Age anomalies
  if (lowerData.includes('child') || lowerData.includes('elderly') || lowerData.includes('age')) {
    tags.push({
      type: 'age-anomaly',
      severity: 'low',
      confidence: 0.6
    });
  }

  // Rural-urban gap
  if (lowerData.includes('rural') || lowerData.includes('urban') || lowerData.includes('tribal')) {
    tags.push({
      type: 'rural-urban-gap',
      severity: 'medium',
      confidence: 0.7
    });
  }

  return tags;
}

// ============ ACTIONABLE SUGGESTIONS ============
function generateActionableSteps(tags: TrendTag[], region: string): string[] {
  const actions: string[] = [];

  tags.forEach(tag => {
    switch (tag.type) {
      case 'migration-linked':
        if (tag.severity === 'high' || tag.severity === 'critical') {
          actions.push(`Deploy mobile enrollment units to ${region} to handle migration-driven surge`);
          actions.push(`Increase biometric update capacity by 40% in next quarter`);
        }
        break;
      case 'update-backlog':
        actions.push(`Launch targeted awareness campaign for pending demographic updates in ${region}`);
        actions.push(`Set up weekend enrollment camps in underserved pincodes`);
        break;
      case 'gender-skew':
        actions.push(`Initiate women-centric enrollment drives in ${region} with female operators`);
        actions.push(`Partner with SHGs and Anganwadi centers for outreach`);
        break;
      case 'enrollment-surge':
        actions.push(`Allocate additional resources to enrollment centers experiencing high demand`);
        break;
      case 'age-anomaly':
        actions.push(`Focus on child enrollment (0-5 years) through school partnerships in ${region}`);
        actions.push(`Conduct biometric refresh drives for elderly citizens (65+)`);
        break;
      case 'rural-urban-gap':
        actions.push(`Strengthen rural enrollment infrastructure in ${region}`);
        actions.push(`Deploy van-based mobile enrollment for remote tribal areas`);
        break;
    }
  });

  return [...new Set(actions)]; // Remove duplicates
}

// ============ MAIN AI GENERATOR ============
export const generatePolicyInsight = async (
  region: string,
  dataSummary: string,
  audience: AudienceType = 'policymaker',
  language: Language = 'EN'
): Promise<InsightResponse> => {

  // Create cache key
  const cacheKey = `${region}-${audience}-${language}-${dataSummary.substring(0, 50)}`;

  // Check cache first
  const cached = getCachedInsight(cacheKey);
  if (cached) {
    return cached;
  }

  // Detect trends and generate tags
  const tags = detectTrends(dataSummary, region);
  const actionableSteps = generateActionableSteps(tags, region);

  // Initialize Gemini AI
  // Use import.meta.env for Vite environment variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY not found in environment variables');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Use a more stable endpoint/model reference if available
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Build audience-aware prompt
  const audienceContext = AUDIENCE_TEMPLATES[audience];
  const prompt = `${audienceContext}
  
Region: ${region}
Data Summary: ${dataSummary}
Detected Trends: ${tags.map(t => t.type).join(', ')}

Generate a comprehensive insight report (250-300 words).
${language === 'EN' ? 'Write in English.' : ''}
`;

  try {
    // Generate English insight
    const result = await model.generateContent(prompt);
    const insight = result.response.text() || "Insight could not be generated.";

    // Generate Hindi translation if requested
    let insightHindi: string | undefined;
    if (language === 'HI') {
      const hindiPrompt = `Translate the following Aadhaar policy insight to Hindi (Devanagari script). Maintain the formal tone and structure:

${insight}`;

      const hindiResult = await model.generateContent(hindiPrompt);
      insightHindi = hindiResult.response.text();
    }

    // Construct response
    const response: InsightResponse = {
      insight,
      insightHindi,
      tags,
      actionableSteps,
      timestamp: Date.now(),
      cacheKey
    };

    // Cache the result
    setCachedInsight(cacheKey, response);

    return response;

  } catch (error) {
    console.error("Gemini Error:", error);

    // Return fallback response that won't crash the UI
    return {
      insight: "AI Insight Engine is currently adjusting parameters. Please try again in 30 seconds.",
      insightHindi: "एआई अंतर्दृष्टि इंजन वर्तमान में मापदंडों को समायोजित कर रहा है। कृपया 30 सेकंड में पुन: प्रयास करें।",
      tags: [],
      actionableSteps: ["Ensure internet connectivity is stable", "Verify API key limits", "Retry regional sync"],
      timestamp: Date.now(),
      cacheKey
    };
  }
};

// ============ CACHE UTILITIES ============
export function clearInsightCache(): void {
  insightCache.clear();
  console.log("[CACHE CLEARED] All cached insights removed");
}

export function getCacheStats(): { size: number; oldestEntry: number | null } {
  let oldest: number | null = null;
  insightCache.forEach(entry => {
    if (!oldest || entry.timestamp < oldest) {
      oldest = entry.timestamp;
    }
  });

  return {
    size: insightCache.size,
    oldestEntry: oldest
  };
}
