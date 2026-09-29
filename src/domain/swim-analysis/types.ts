export type FatigueType = 'respiratory' | 'cardio' | 'muscular' | 'mixed' | 'unknown';
export type ConsistencyLevel = 'low' | 'medium' | 'high';
export type EfficiencyLevel = 'poor' | 'normal' | 'good' | 'excellent';
export type MainLimiter = 'breathing' | 'pace' | 'technique' | 'fatigue' | 'environment' | 'unknown';

export interface SwimAnalysisInput {
  distanceMeters?: number;
  durationSeconds?: number;
  totalTimeMinutes?: number;
  activeDurationSeconds?: number;
  activeTimeMinutes?: number;
  restTimeMinutes?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgSwolf?: number;
  bestSwolf?: number;
  worstSwolf?: number;
  laps?: Array<{ swolf?: number; splitSeconds?: number; distanceMeters?: number }>;
  poolLengthMeters?: number;
  perceivedFatigue?: number;
  fatigue?: number;
  breathingDifficulty?: number;
  breathFeeling?: string;
  gymBeforeSession?: boolean;
  moodBefore?: string;
  moodAfter?: string;
  notes?: string;
}

export interface SwimSessionAnalysis {
  fatigueType: FatigueType;
  consistency: ConsistencyLevel;
  efficiencyLevel: EfficiencyLevel;
  mainLimiter: MainLimiter;
  insights: string[];
  warnings: string[];
  score: {
    breathing: number;
    consistency: number;
    efficiency: number;
    endurance: number;
  };
}
