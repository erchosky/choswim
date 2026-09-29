import type { EfficiencyLevel, SwimAnalysisInput } from './types';

export function analyzeEfficiency(input: SwimAnalysisInput): { efficiencyLevel: EfficiencyLevel; score: number; insights: string[] } {
  const distance = Number(input.distanceMeters ?? 0);
  const activeMinutes = input.activeTimeMinutes ?? (input.activeDurationSeconds ? input.activeDurationSeconds / 60 : 0);
  const avgSwolf = input.avgSwolf;
  const insights: string[] = [];
  let score = 58;

  if (distance > 0 && activeMinutes > 0) {
    const paceSeconds = (activeMinutes * 60) / (distance / 100);
    if (paceSeconds <= 115) score += 24;
    else if (paceSeconds <= 150) score += 12;
    else if (paceSeconds >= 210) score -= 18;
  } else {
    insights.push('Faltan distancia o tiempo activo para medir eficiencia con precisión.');
  }

  if (avgSwolf !== undefined) {
    if (avgSwolf <= 38) score += 18;
    else if (avgSwolf <= 48) score += 8;
    else if (avgSwolf >= 65) score -= 18;
  }

  const finalScore = clamp(score);
  const efficiencyLevel: EfficiencyLevel = finalScore >= 85 ? 'excellent' : finalScore >= 70 ? 'good' : finalScore >= 45 ? 'normal' : 'poor';
  if (efficiencyLevel === 'good' || efficiencyLevel === 'excellent') insights.push('Tus mejores datos apuntan a una técnica útil cuando mantienes control.');
  if (efficiencyLevel === 'poor') insights.push('La eficiencia cayó: conviene priorizar técnica, respiración y ritmo antes que sumar metros.');
  return { efficiencyLevel, score: finalScore, insights };
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
