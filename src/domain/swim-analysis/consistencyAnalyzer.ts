import type { ConsistencyLevel, SwimAnalysisInput } from './types';

export function analyzeConsistency(input: SwimAnalysisInput): { consistency: ConsistencyLevel; score: number; insights: string[] } {
  const swolfValues = getSwolfValues(input);
  const restRatio = getRestRatio(input);
  const insights: string[] = [];
  let score = 72;

  if (swolfValues.length >= 2) {
    const spread = Math.max(...swolfValues) - Math.min(...swolfValues);
    if (spread >= 16) {
      insights.push('El SWOLF fue muy variable: hubo largos buenos, pero todavía no se sostienen estables.');
      score -= 35;
    } else if (spread >= 8) {
      insights.push('La consistencia fue intermedia: hay variaciones, pero no una caída fuerte.');
      score -= 14;
    } else {
      insights.push('La sesión fue bastante estable largo a largo.');
      score += 12;
    }
  }

  if (restRatio > 0.35) {
    insights.push('El descanso ocupó mucho peso dentro de la sesión y baja la continuidad.');
    score -= 20;
  }

  const finalScore = clamp(score);
  return {
    consistency: finalScore >= 75 ? 'high' : finalScore >= 45 ? 'medium' : 'low',
    score: finalScore,
    insights
  };
}

function getSwolfValues(input: SwimAnalysisInput) {
  if (input.laps?.length) return input.laps.map((lap) => lap.swolf).filter((value): value is number => typeof value === 'number');
  return [input.bestSwolf, input.avgSwolf, input.worstSwolf].filter((value): value is number => typeof value === 'number');
}

function getRestRatio(input: SwimAnalysisInput) {
  const totalMinutes = input.totalTimeMinutes ?? (input.durationSeconds ? input.durationSeconds / 60 : 0);
  if (!totalMinutes) return 0;
  return Math.max(0, Number(input.restTimeMinutes ?? 0) / totalMinutes);
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
