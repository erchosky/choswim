import type { SessionNarrativeInput } from './types';

export function buildTechnicalInsight(input: SessionNarrativeInput) {
  const { analysis } = input;
  if (analysis.fatigueType === 'respiratory') return 'Lectura técnica: respiración/tensión fue el limitador principal; no lo trates como falta de forma.';
  if (analysis.consistency === 'low') return 'Lectura técnica: la sesión tuvo picos buenos, pero la estabilidad cayó entre largos.';
  if (analysis.efficiencyLevel === 'good' || analysis.efficiencyLevel === 'excellent') return 'Lectura técnica: hay eficiencia aprovechable; el foco es repetirla más tiempo.';
  return analysis.insights[0] ?? 'Lectura técnica: faltan datos finos, pero la sesión sirve como base de comparación.';
}

export function buildNextAction(input: SessionNarrativeInput) {
  const { analysis } = input;
  if (analysis.mainLimiter === 'breathing') return 'Haz 6-8 largos suaves priorizando exhalar bajo el agua y parar antes de saturarte.';
  if (analysis.mainLimiter === 'technique') return 'Haz un bloque técnico corto: 4 largos drill + 4 largos nado fácil.';
  if (analysis.score.endurance < 50) return 'Busca continuidad: mismo ritmo, menos pausa total.';
  return 'Repite una sesión parecida y compara respiración, ritmo y descanso.';
}
