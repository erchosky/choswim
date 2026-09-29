import { inCurrentWeek, isToday, toDate } from '../../lib/date';
import type { DistanceRoute, SwimSession } from '../../types/models';

export type TrophyRarity = 'común' | 'raro' | 'épico' | 'legendario';

export interface TrophyDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: TrophyRarity;
  xpReward: number;
  target: number;
}

export interface TrophyProgress extends TrophyDefinition {
  progress: number;
  progressPercent: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export const TROPHIES: TrophyDefinition[] = [
  { id: 'first-session', title: 'Primer chapuzón serio', description: 'Registra tu primer entrenamiento.', icon: 'Waves', rarity: 'común', xpReward: 50, target: 1 },
  { id: 'first-1k', title: 'Primer kilómetro', description: 'Nada 1.000m en una sesión.', icon: 'Medal', rarity: 'común', xpReward: 80, target: 1000 },
  { id: 'weekly-5k', title: 'Semana de 5K', description: 'Completa 5.000m en una semana.', icon: 'Trophy', rarity: 'raro', xpReward: 180, target: 5000 },
  { id: 'weekly-3-sessions', title: 'Semana completa', description: 'Completa 3 sesiones en una semana.', icon: 'CalendarCheck', rarity: 'raro', xpReward: 200, target: 3 },
  { id: 'streak-7', title: 'Fuego de 7 días', description: 'Mantén una racha de 7 días.', icon: 'Flame', rarity: 'raro', xpReward: 220, target: 7 },
  { id: 'streak-30', title: 'Motor imparable', description: 'Mantén una racha de 30 días.', icon: 'Zap', rarity: 'legendario', xpReward: 1000, target: 30 },
  { id: 'water-weights', title: 'Fuerza acuática', description: 'Completa 3 sesiones con pesas acuáticas.', icon: 'Dumbbell', rarity: 'raro', xpReward: 180, target: 3 },
  { id: 'no-weights', title: 'Técnica limpia', description: 'Completa 5 sesiones sin pesas.', icon: 'BadgeCheck', rarity: 'común', xpReward: 120, target: 5 },
  { id: 'pace-improvement', title: 'Ritmo mejorado', description: 'Mejora tu ritmo medio respecto a tus primeras sesiones.', icon: 'Gauge', rarity: 'épico', xpReward: 300, target: 1 },
  { id: 'morning-swimmer', title: 'Madrugador', description: 'Registra una sesión antes de las 9:00.', icon: 'Sunrise', rarity: 'raro', xpReward: 120, target: 1 },
  { id: 'night-swimmer', title: 'Turno nocturno', description: 'Registra una sesión después de las 21:00.', icon: 'Moon', rarity: 'raro', xpReward: 120, target: 1 },
  { id: 'weekly-marathon', title: 'Maratón semanal', description: 'Nada 15.000m en una semana.', icon: 'Crown', rarity: 'legendario', xpReward: 750, target: 15000 },
  { id: 'route-complete', title: 'Ruta completada', description: 'Completa al menos una ruta favorita.', icon: 'MapPin', rarity: 'épico', xpReward: 300, target: 1 },
  { id: 'boss-defeated', title: 'Boss vencido', description: 'Derrota el boss semanal completando su objetivo.', icon: 'Crown', rarity: 'épico', xpReward: 500, target: 1 },
  { id: 'beat-friend', title: 'Colega superado', description: 'Supera a un amigo en el duelo privado semanal.', icon: 'Swords', rarity: 'épico', xpReward: 350, target: 1 },
  { id: 'consistency-brutal', title: 'Constancia brutal', description: 'Completa 12 sesiones registradas.', icon: 'Shield', rarity: 'legendario', xpReward: 900, target: 12 }
];

export function evaluateTrophies(input: {
  sessions: SwimSession[];
  weeklyMeters: number;
  streakDays: number;
  routes?: DistanceRoute[];
  bossTargetMeters?: number;
  friendDuelWon?: boolean;
}): TrophyProgress[] {
  return TROPHIES.map((trophy) => {
    const progress = getProgress(trophy.id, input);
    const unlocked = progress >= trophy.target;
    return {
      ...trophy,
      progress,
      progressPercent: Math.min(100, Math.round((progress / trophy.target) * 100)),
      unlocked,
      unlockedAt: unlocked ? latestSessionDate(input.sessions) : undefined
    };
  });
}

export function getPersonalRecords(sessions: SwimSession[]) {
  const bestDistance = Math.max(0, ...sessions.map((session) => session.totalDistanceMeters));
  const bestScore = Math.max(0, ...sessions.map((session) => session.sessionScore));
  const bestPace = Math.min(...sessions.map((session) => session.pacePer100m).filter((pace) => pace > 0));
  const totalMeters = sessions.reduce((sum, session) => sum + session.totalDistanceMeters, 0);

  return {
    bestDistance,
    bestScore,
    bestPace: Number.isFinite(bestPace) ? bestPace : 0,
    totalMeters
  };
}

function getProgress(trophyId: string, input: { sessions: SwimSession[]; weeklyMeters: number; streakDays: number; routes?: DistanceRoute[]; bossTargetMeters?: number; friendDuelWon?: boolean }) {
  switch (trophyId) {
    case 'first-session':
      return input.sessions.length;
    case 'first-1k':
      return Math.max(0, ...input.sessions.map((session) => session.totalDistanceMeters));
    case 'weekly-5k':
      return input.weeklyMeters;
    case 'weekly-3-sessions':
      return input.sessions.filter((session) => inCurrentWeek(session.date)).length;
    case 'streak-7':
    case 'streak-30':
      return input.streakDays;
    case 'water-weights':
      return input.sessions.filter((session) => Boolean(session.waterWeights) && session.waterWeights !== 'none').length;
    case 'no-weights':
      return input.sessions.filter((session) => session.waterWeights === 'none').length;
    case 'pace-improvement':
      return hasPaceImproved(input.sessions) ? 1 : 0;
    case 'morning-swimmer':
      return startHours(input.sessions).some((hour) => hour < 9) ? 1 : 0;
    case 'night-swimmer':
      return startHours(input.sessions).some((hour) => hour >= 21) ? 1 : 0;
    case 'weekly-marathon':
      return input.weeklyMeters;
    case 'route-complete': {
      const favorite = input.routes?.find((route) => route.isFavorite);
      if (!favorite) return 0;
      return input.sessions.some((session) => session.totalDistanceMeters >= favorite.distanceMeters) ? 1 : 0;
    }
    case 'boss-defeated':
      return input.bossTargetMeters && input.weeklyMeters >= input.bossTargetMeters ? 1 : 0;
    case 'beat-friend':
      return input.friendDuelWon ? 1 : 0;
    case 'consistency-brutal':
      return input.sessions.length;
    default:
      return 0;
  }
}

/** Hora de inicio real: solo la tienen las sesiones importadas (las manuales guardan solo el día). */
function startHours(sessions: SwimSession[]) {
  return sessions.flatMap((session) => (session.startDate ? [toDate(session.startDate).getHours()] : []));
}

function hasPaceImproved(sessions: SwimSession[]) {
  const paces = [...sessions].reverse().map((session) => session.pacePer100m).filter((pace) => pace > 0);
  if (paces.length < 4) return false;
  const firstAvg = average(paces.slice(0, 2));
  const latestAvg = average(paces.slice(-2));
  return latestAvg < firstAvg;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function latestSessionDate(sessions: SwimSession[]) {
  const latest = sessions.find((session) => isToday(session.date)) ?? sessions[0];
  return latest ? toDate(latest.date) : new Date();
}
