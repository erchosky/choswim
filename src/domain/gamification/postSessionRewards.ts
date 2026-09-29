import { getBestMatchingRoutes } from '../distance-equivalences/routeEquivalences';
import { getRankForXP, getRankProgress } from '../ranks/ranks';
import { formatPace } from '../swimming/metrics';
import { evaluateTrophies, getPersonalRecords } from './achievements';
import type { DistanceRoute, SwimSession, UserProfile } from '../../types/models';

export function buildPostSessionReward(input: {
  session: SwimSession;
  previousSessions: SwimSession[];
  profile: UserProfile;
  routes: DistanceRoute[];
  weeklyMeters: number;
}) {
  const allSessions = [input.session, ...input.previousSessions];
  const previousRecords = getPersonalRecords(input.previousSessions);
  const currentRecords = getPersonalRecords(allSessions);
  const rank = getRankForXP(input.profile.xp ?? 0);
  const equivalent = getBestMatchingRoutes(input.session.totalDistanceMeters, input.routes, 1)[0];
  const trophies = evaluateTrophies({
    sessions: allSessions,
    weeklyMeters: input.weeklyMeters,
    streakDays: input.profile.streakDays ?? 0,
    routes: input.routes
  }).filter((trophy) => trophy.unlocked);

  const personalRecords = [
    currentRecords.bestDistance > previousRecords.bestDistance ? `Nueva mejor distancia: ${currentRecords.bestDistance}m` : null,
    currentRecords.bestScore > previousRecords.bestScore ? `Nuevo mejor score: ${currentRecords.bestScore}/100` : null,
    previousRecords.bestPace > 0 && currentRecords.bestPace < previousRecords.bestPace ? `Nuevo mejor ritmo: ${formatPace(currentRecords.bestPace)}` : null
  ].filter(Boolean) as string[];

  return {
    xpGained: input.session.xpGained,
    rankName: rank.name,
    rankProgress: getRankProgress(input.profile.xp ?? 0),
    equivalentPhrase: equivalent?.phrase ?? 'Crea una ruta para ver equivalencias de esta sesión.',
    unlockedTrophies: trophies.slice(0, 3),
    personalRecords,
    nextRecommendation: input.session.perceivedEffort >= 8
      ? 'Próximo paso: recuperación activa o técnica suave.'
      : 'Próximo paso: suma otra sesión corta para proteger racha.'
  };
}
