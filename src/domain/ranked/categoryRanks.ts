import type { SwimSessionAnalysis } from '../swim-analysis/types';
import type { RankedBreakdown, RankedCategory } from './types';

const labels: Record<RankedCategory, string> = {
  breathing: 'Respiración',
  consistency: 'Consistencia',
  technique: 'Técnica',
  endurance: 'Resistencia',
  flow: 'Flow',
  discipline: 'Disciplina'
};

export function buildRankedBreakdown(analysis: SwimSessionAnalysis): RankedBreakdown[] {
  const values: Array<[RankedCategory, number, string]> = [
    ['breathing', analysis.score.breathing, analysis.mainLimiter === 'breathing' ? 'Respiración irregular con buen margen de mejora.' : 'Respiración controlada para la carga de hoy.'],
    ['consistency', analysis.score.consistency, analysis.consistency === 'low' ? 'Variación alta entre bloques o largos.' : 'Continuidad sólida durante la sesión.'],
    ['technique', analysis.score.efficiency, analysis.efficiencyLevel === 'poor' ? 'La eficiencia cayó y pide técnica limpia.' : 'La eficiencia técnica es aprovechable.'],
    ['endurance', analysis.score.endurance, analysis.score.endurance < 50 ? 'La continuidad todavía pesa más que la distancia.' : 'Buena base de resistencia para seguir construyendo.'],
    ['flow', Math.round((analysis.score.breathing + analysis.score.consistency) / 2), 'Flow calculado por respiración y estabilidad.'],
    ['discipline', Math.round((analysis.score.endurance + analysis.score.consistency) / 2), 'Disciplina estimada por continuidad y consistencia.']
  ];

  return values.map(([category, score, reason]) => ({
    category,
    label: labels[category],
    rank: rankFromScore(score),
    progressToNext: score % 25 === 0 && score < 100 ? 100 : Math.round(((score % 25) / 25) * 100),
    reason
  }));
}

function rankFromScore(score: number) {
  if (score >= 90) return 'Diamante I';
  if (score >= 80) return 'Platino II';
  if (score >= 70) return 'Oro III';
  if (score >= 55) return 'Plata II';
  if (score >= 40) return 'Bronce II';
  return 'Bronce I';
}
