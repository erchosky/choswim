import type { ChallengeDifficulty, MainGoal, SessionGoal, SwimLevel, SwimSessionSource, SwimStyle, WaterWeights } from '../../types/models';

export const goalLabels: Record<MainGoal, string> = {
  fat_loss: 'Pérdida de grasa',
  muscle_gain: 'Ganar músculo',
  endurance: 'Resistencia',
  speed: 'Velocidad',
  technique: 'Técnica',
  general: 'General'
};

export const sessionGoalLabels: Record<SessionGoal, string> = {
  ...goalLabels,
  recovery: 'Recuperación'
};

export const levelLabels: Record<SwimLevel, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
};

export const swimStyleLabels: Record<SwimStyle, string> = {
  freestyle: 'Crol',
  breaststroke: 'Braza',
  backstroke: 'Espalda',
  butterfly: 'Mariposa',
  mixed: 'Mixto',
  drills: 'Técnica'
};

export const waterWeightsLabels: Record<WaterWeights, string> = {
  none: 'Sin pesas',
  light: 'Ligeras',
  medium: 'Medias',
  heavy: 'Pesadas'
};

export const challengeDifficultyLabels: Record<ChallengeDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Media',
  hard: 'Difícil',
  boss: 'Boss'
};

export const sessionSourceLabels: Record<SwimSessionSource, string> = {
  manual: 'Manual',
  apple_health: 'Apple Watch'
};
