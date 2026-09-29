import type { SessionNarrativeInput } from './types';

export function headlineFor(input: SessionNarrativeInput) {
  const { analysis } = input;
  if (analysis.fatigueType === 'respiratory') return 'Hoy mandó la respiración, no el cardio.';
  if (analysis.mainLimiter === 'technique') return 'Tu técnica apareció por momentos; ahora toca sostenerla.';
  if (analysis.efficiencyLevel === 'excellent') return 'Sesión muy eficiente: pocos metros desperdiciados.';
  if (analysis.consistency === 'low') return 'Entreno útil para detectar dónde se rompe el ritmo.';
  return 'Sesión registrada con progreso real.';
}

export function summaryFor(input: SessionNarrativeInput) {
  const { analysis, distanceMeters } = input;
  if (analysis.fatigueType === 'respiratory') {
    return `Has nadado ${distanceMeters}m con una limitación más respiratoria que cardiovascular. Tu cuerpo aguantó mejor de lo que tu respiración te hizo sentir.`;
  }
  if (analysis.fatigueType === 'cardio') return `Has nadado ${distanceMeters}m con carga cardiovascular alta. La señal principal fue controlar intensidad y recuperación.`;
  if (analysis.consistency === 'low') return `Has nadado ${distanceMeters}m con variaciones claras. No fue un mal entreno: fue un entreno condicionado por pausas, respiración o técnica.`;
  return `Has nadado ${distanceMeters}m y acumulaste una señal útil para ajustar el siguiente entrenamiento.`;
}
