import type { DistanceRoute, MainGoal, SwimLevel, SwimSession } from '../../types/models';

export interface DailyMission {
  title: string;
  description: string;
  targetMeters: number;
  rewardXP: number;
  focus: 'suave' | 'técnica' | 'ritmo' | 'fuerza' | 'recuperación';
}

export function generateDailyMission(input: {
  mainGoal: MainGoal;
  level: SwimLevel;
  sessionsWeek: number;
  weeklyMeters: number;
  weeklyTargetMeters: number;
  lastSession?: SwimSession | null;
  favoriteRoute?: DistanceRoute;
}): DailyMission {
  const remaining = Math.max(0, input.weeklyTargetMeters - input.weeklyMeters);
  const baseTarget = input.level === 'advanced' ? 1500 : input.level === 'intermediate' ? 1000 : 600;

  if (input.lastSession && input.lastSession.intensity >= 8 && input.lastSession.perceivedEffort >= 8) {
    return {
      title: 'Misión de recuperación',
      description: 'Vienes de carga alta. Suma sin romper: técnica suave, respiración y salir fresco.',
      targetMeters: Math.min(800, baseTarget),
      rewardXP: 90,
      focus: 'recuperación'
    };
  }

  if (input.sessionsWeek === 0) {
    return {
      title: 'Arranque de semana',
      description: 'Haz una sesión corta para activar racha y abrir el mapa semanal.',
      targetMeters: input.favoriteRoute ? Math.min(input.favoriteRoute.distanceMeters, baseTarget) : baseTarget,
      rewardXP: 120,
      focus: 'suave'
    };
  }

  if (input.mainGoal === 'technique') {
    return { title: 'Técnica limpia', description: 'Drills cortos, agarre alto y respiración controlada.', targetMeters: 800, rewardXP: 130, focus: 'técnica' };
  }

  if (input.mainGoal === 'muscle_gain') {
    return { title: 'Fuerza acuática', description: 'Bloques con pesas ligeras y descanso real.', targetMeters: 900, rewardXP: 150, focus: 'fuerza' };
  }

  return {
    title: remaining <= 0 ? 'Bonus sin sobrecarga' : 'Empuje hacia la meta',
    description: remaining <= 0 ? 'Meta semanal hecha. Mantén sensaciones con nado fácil.' : 'Recorta distancia hacia tu objetivo semanal.',
    targetMeters: remaining <= 0 ? Math.min(700, baseTarget) : Math.min(Math.max(remaining, 600), baseTarget),
    rewardXP: remaining <= 0 ? 80 : 140,
    focus: input.mainGoal === 'speed' ? 'ritmo' : 'suave'
  };
}
