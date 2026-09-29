import { inferBreathingDifficulty } from './breathingAnalyzer';
import type { FatigueType, MainLimiter, SwimAnalysisInput } from './types';

export function classifyFatigue(input: SwimAnalysisInput): { fatigueType: FatigueType; mainLimiter: MainLimiter; insights: string[]; warnings: string[] } {
  const heartRate = input.avgHeartRate;
  const breathing = inferBreathingDifficulty(input);
  const fatigue = input.perceivedFatigue ?? input.fatigue;
  const restRatio = getRestRatio(input);
  const insights: string[] = [];
  const warnings: string[] = [];

  if (breathing && breathing >= 7 && (!heartRate || heartRate < 140)) {
    insights.push('La señal principal no fue cardiovascular: la respiración/tensión pesó más que el pulso.');
    return { fatigueType: 'respiratory', mainLimiter: 'breathing', insights, warnings };
  }

  if (fatigue && fatigue >= 7 && heartRate && heartRate < 135) {
    insights.push('La fatiga percibida fue alta para una frecuencia cardiaca moderada; probablemente hubo tensión, respiración o carga previa.');
    return { fatigueType: 'respiratory', mainLimiter: 'breathing', insights, warnings };
  }

  if (heartRate && heartRate >= 160 && fatigue && fatigue >= 7) {
    insights.push('La sesión sí tuvo una carga cardiovascular alta y conviene controlar la recuperación.');
    return { fatigueType: 'cardio', mainLimiter: 'fatigue', insights, warnings };
  }

  if (input.gymBeforeSession || (fatigue && fatigue >= 7 && restRatio > 0.28)) {
    insights.push('La carga muscular o la sesión previa pudo condicionar la continuidad en el agua.');
    return { fatigueType: 'muscular', mainLimiter: 'fatigue', insights, warnings };
  }

  if ((breathing && breathing >= 6) || (heartRate && heartRate >= 150) || restRatio > 0.35) {
    insights.push('La limitación fue mixta: respiración, pausas y carga se combinaron.');
    return { fatigueType: 'mixed', mainLimiter: breathing && breathing >= 6 ? 'breathing' : 'fatigue', insights, warnings };
  }

  if (!heartRate && !breathing && !fatigue) warnings.push('Faltan sensaciones, respiración o pulso para clasificar la fatiga con precisión.');
  return { fatigueType: 'unknown', mainLimiter: 'unknown', insights, warnings };
}

function getRestRatio(input: SwimAnalysisInput) {
  const totalMinutes = input.totalTimeMinutes ?? (input.durationSeconds ? input.durationSeconds / 60 : 0);
  if (!totalMinutes) return 0;
  return Math.max(0, Number(input.restTimeMinutes ?? 0) / totalMinutes);
}
