import { breathingScore } from './breathingAnalyzer';
import { analyzeConsistency } from './consistencyAnalyzer';
import { analyzeEfficiency } from './efficiencyAnalyzer';
import { classifyFatigue } from './fatigueClassifier';
import type { SwimAnalysisInput, SwimSessionAnalysis } from './types';

export function analyzeSession(input: SwimAnalysisInput): SwimSessionAnalysis {
  const fatigue = classifyFatigue(input);
  const consistency = analyzeConsistency(input);
  const efficiency = analyzeEfficiency(input);
  const endurance = enduranceScore(input);

  return {
    fatigueType: fatigue.fatigueType,
    consistency: consistency.consistency,
    efficiencyLevel: efficiency.efficiencyLevel,
    mainLimiter: fatigue.mainLimiter !== 'unknown' ? fatigue.mainLimiter : inferLimiterFromEfficiency(efficiency.score, consistency.score),
    insights: unique([...fatigue.insights, ...consistency.insights, ...efficiency.insights]),
    warnings: fatigue.warnings,
    score: {
      breathing: breathingScore(input),
      consistency: consistency.score,
      efficiency: efficiency.score,
      endurance
    }
  };
}

function enduranceScore(input: SwimAnalysisInput) {
  const total = input.totalTimeMinutes ?? (input.durationSeconds ? input.durationSeconds / 60 : 0);
  const rest = Number(input.restTimeMinutes ?? 0);
  if (!total) return 50;
  const activeRatio = Math.max(0, Math.min(1, (total - rest) / total));
  const distanceBonus = Math.min(25, Number(input.distanceMeters ?? 0) / 80);
  return Math.max(0, Math.min(100, Math.round(activeRatio * 75 + distanceBonus)));
}

function inferLimiterFromEfficiency(efficiency: number, consistency: number) {
  if (consistency < 45) return 'technique';
  if (efficiency < 45) return 'pace';
  return 'unknown';
}

function unique(values: string[]) {
  return [...new Set(values)].slice(0, 5);
}
