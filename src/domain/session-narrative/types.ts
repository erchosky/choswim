import type { SwimSessionAnalysis } from '../swim-analysis/types';

export interface SessionNarrativeInput {
  distanceMeters: number;
  totalTimeMinutes?: number;
  moodBefore?: string;
  moodAfter?: string;
  notes?: string;
  analysis: SwimSessionAnalysis;
}

export interface SessionNarrative {
  headline: string;
  summary: string;
  coachMessage: string;
  technicalInsight: string;
  nextAction: string;
}
