import type { SessionNarrativeInput } from './types';

export function buildCoachMessage(input: SessionNarrativeInput) {
  const { analysis } = input;
  if (analysis.fatigueType === 'respiratory') {
    return 'Próxima misión: bloque corto, respiración controlada y descansos medidos. No persigas más metros si el cuello de botella es el aire.';
  }
  if (analysis.mainLimiter === 'technique') {
    return 'Próxima misión: menos prisa y más repetición limpia. Tus mejores largos muestran que sí tienes técnica, pero aún no la sostienes estable.';
  }
  if (analysis.score.endurance < 45) return 'Próxima misión: continuidad suave. Recorta descansos antes de subir intensidad.';
  if (analysis.score.efficiency >= 80) return 'Próxima misión: conserva ese ritmo y añade un bloque corto de calidad.';
  return 'Próxima misión: repetir base, ajustar sensaciones y buscar un dato un poco más estable.';
}
