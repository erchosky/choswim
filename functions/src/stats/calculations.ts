/**
 * Cálculos puros de sesiones y estadísticas (sin Firestore), para poder testearlos.
 * Deben coincidir con los del cliente en src/domain (xpEngine, metrics, ranks).
 */
import { asDate, dayNumber, isInWeekOf, weekStartDay } from './time.js';

export type SessionData = Record<string, unknown>;
export type ProfileData = Record<string, unknown>;

const num = (value: unknown, fallback = 0) => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function pacePer100m(distanceMeters: number, activeTimeMinutes: number) {
  if (distanceMeters <= 0 || activeTimeMinutes <= 0) return 0;
  return Number(((activeTimeMinutes * 60) / (distanceMeters / 100)).toFixed(1));
}

export function estimateCalories(distanceMeters: number, activeTimeMinutes: number, weightKg: number, intensity: number, waterWeights?: unknown) {
  const met = 5.8 + intensity * 0.42 + (waterWeights && waterWeights !== 'none' ? 1.1 : 0);
  return Math.round(met * weightKg * (activeTimeMinutes / 60) * Math.max(0.75, distanceMeters / Math.max(1, activeTimeMinutes * 35)));
}

export function scoreSession(distance: number, active: number, intensity: number, effort: number, rest: number) {
  const raw = Math.min(40, distance / 75)
    + Math.min(25, active * 0.8)
    + Math.min(20, intensity * 2)
    + Math.max(0, 10 - Math.abs(intensity - effort))
    - Math.max(0, rest - active * 0.35) * 0.25;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export interface XpInput {
  distanceMeters: number;
  activeTimeMinutes: number;
  intensity: number;
  perceivedEffort: number;
  previousBestDistance?: number;
  previousBestPace?: number;
  pacePer100m?: number;
  streakDays?: number;
}

export function calculateXP(input: XpInput) {
  const base = Math.round(input.distanceMeters / 20 + input.activeTimeMinutes * 1.5);
  const intensityBonus = Math.round(base * Math.min(0.3, Math.max(0, input.intensity - 4) * 0.04));
  const completionBonus = input.distanceMeters >= 1000 && input.activeTimeMinutes >= 25 ? 35 : input.distanceMeters >= 500 ? 15 : 0;
  const distancePR = input.previousBestDistance ? input.distanceMeters > input.previousBestDistance : false;
  const pacePR = input.previousBestPace && input.pacePer100m ? input.pacePer100m < input.previousBestPace : false;
  const personalRecordBonus = distancePR || pacePR ? 60 : 0;
  const streakBonus = Math.min(80, Math.max(0, input.streakDays ?? 0) * 8);
  const penalty = Math.abs(input.intensity - input.perceivedEffort) >= 6 ? Math.round(base * 0.18) : 0;
  return Math.max(5, base + intensityBonus + completionBonus + personalRecordBonus + streakBonus - penalty);
}

const RANK_THRESHOLDS: Array<[number, string]> = [
  [40000, 'Poseidón'],
  [24000, 'Kraken'],
  [15000, 'Tiburón'],
  [9000, 'Diamante'],
  [5000, 'Platino'],
  [2500, 'Oro'],
  [1000, 'Plata'],
  [0, 'Bronce']
];

export function getRankName(xp: number) {
  return RANK_THRESHOLDS.find(([minXP]) => xp >= minXP)?.[1] ?? 'Bronce';
}

function bestPaceOf(sessions: SessionData[]) {
  const paces = sessions.map((session) => num(session.pacePer100m)).filter((pace) => pace > 0);
  return paces.length ? Math.min(...paces) : undefined;
}

/** Campos calculados de una sesión a partir de sus datos y del resto de sesiones del usuario. */
export function computeSession(session: SessionData, profile: ProfileData, otherSessions: SessionData[]) {
  const distance = num(session.totalDistanceMeters);
  const active = num(session.activeTimeMinutes);
  const intensity = num(session.intensity, 1);
  const perceivedEffort = num(session.perceivedEffort, intensity);
  const pace = pacePer100m(distance, active);
  // Racha previa calculada con las sesiones reales hasta el día de esta sesión
  // (profile.streakDays puede estar desactualizado si el usuario dejó de entrenar).
  const sessionDate = asDate(session.date);
  const earlierSessions = otherSessions.filter((item) => dayNumber(asDate(item.date)) < dayNumber(sessionDate));

  const computedXP = calculateXP({
    distanceMeters: distance,
    activeTimeMinutes: active,
    intensity,
    perceivedEffort,
    pacePer100m: pace,
    previousBestDistance: Math.max(0, ...otherSessions.map((item) => num(item.totalDistanceMeters))),
    previousBestPace: bestPaceOf(otherSessions),
    streakDays: computeStreakDays(earlierSessions, sessionDate)
  });
  const estimatedCalories = estimateCalories(distance, active, num(profile.weightKg, 75), intensity, session.waterWeights);
  const sessionScore = scoreSession(distance, active, intensity, perceivedEffort, num(session.restTimeMinutes));
  const consistencyScore = Math.min(100, Math.round(((otherSessions.length + 1) / 3) * 100));

  return {
    computedXP,
    computedStats: { pacePer100m: pace, estimatedCalories, sessionScore, consistencyScore },
    pacePer100m: pace,
    estimatedCalories,
    sessionScore,
    consistencyScore
  };
}

/** Campos introducidos por el usuario: si ninguno cambia no hace falta recalcular. */
const RAW_SESSION_FIELDS = [
  'date', 'poolLengthMeters', 'totalDistanceMeters', 'totalTimeMinutes', 'activeTimeMinutes', 'restTimeMinutes',
  'laps', 'style', 'intensity', 'perceivedEffort', 'waterWeights', 'goal', 'fatigue'
];

export function rawSessionChanged(before: SessionData, after: SessionData) {
  return RAW_SESSION_FIELDS.some((field) => JSON.stringify(before[field]) !== JSON.stringify(after[field]));
}

/** Racha de días consecutivos que termina hoy o ayer respecto a `now` (en la zona de la app). */
export function computeStreakDays(sessions: SessionData[], now = new Date()) {
  const days = [...new Set(sessions.map((session) => dayNumber(asDate(session.date))))].sort((a, b) => b - a);
  const today = dayNumber(now);
  if (!days.length || days[0]! < today - 1) return 0;
  let streak = 1;
  for (let index = 1; index < days.length && days[index] === days[index - 1]! - 1; index += 1) streak += 1;
  return streak;
}

/** Agregados del perfil sobre TODAS las sesiones del usuario. */
export function aggregateSessions(sessions: SessionData[], now = new Date()) {
  const xpOf = (session: SessionData) => num(session.computedXP ?? session.xpGained);
  const weekly = sessions.filter((session) => isInWeekOf(asDate(session.date), now));
  const xp = sessions.reduce((sum, session) => sum + xpOf(session), 0);

  return {
    xp,
    sessionCount: sessions.length,
    totalMeters: sessions.reduce((sum, session) => sum + num(session.totalDistanceMeters), 0),
    totalActiveMinutes: sessions.reduce((sum, session) => sum + num(session.activeTimeMinutes), 0),
    bestDistance: Math.max(0, ...sessions.map((session) => num(session.totalDistanceMeters))),
    bestPace: bestPaceOf(sessions) ?? 0,
    weeklyMeters: weekly.reduce((sum, session) => sum + num(session.totalDistanceMeters), 0),
    weeklyXP: weekly.reduce((sum, session) => sum + xpOf(session), 0),
    weeklySessionCount: weekly.length,
    // Semana a la que corresponden los valores weekly*: el ranking descarta los de semanas pasadas.
    weeklyStatsWeekStart: weekStartDay(now),
    streakDays: computeStreakDays(sessions, now),
    lastSessionDay: sessions.length ? Math.max(...sessions.map((session) => dayNumber(asDate(session.date)))) : null,
    rankName: getRankName(xp)
  };
}
