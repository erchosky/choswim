import { analyzeSession } from '../../domain/swim-analysis/analyzeSession';
import { calculateVirtualProgress } from '../../domain/geo-progress/calculateVirtualProgress';
import { calculateSymbolicRouteProgress } from '../../domain/geo-progress/routeProgress';
import { generateSessionNarrative } from '../../domain/session-narrative/generateSessionNarrative';
import { buildRankedBreakdown } from '../../domain/ranked/categoryRanks';
import sampleRoutes from '../../data/routes/sample-local-routes.json';
import type { GeoPoint, SymbolicRoute } from '../../domain/geo-progress/types';
import type { DistanceRoute, SwimSession } from '../../types/models';

/** Punto de partida por defecto del avance virtual (Puerta del Sol) si el usuario no define el suyo. */
export const defaultStartCoords: GeoPoint = { lat: 40.4169, lng: -3.7035 };

export function buildSessionMeaning(input: {
  session: Partial<SwimSession>;
  routes?: DistanceRoute[];
  userHomeCoords?: GeoPoint;
}) {
  const session = input.session;
  const distanceMeters = Number(session.totalDistanceMeters ?? 0);
  const analysis = analyzeSession({
    distanceMeters,
    totalTimeMinutes: session.totalTimeMinutes,
    activeTimeMinutes: session.activeTimeMinutes,
    restTimeMinutes: session.restTimeMinutes,
    avgHeartRate: session.avgHeartRate,
    maxHeartRate: session.maxHeartRate,
    avgSwolf: session.avgSwolf,
    bestSwolf: session.bestSwolf,
    worstSwolf: session.worstSwolf,
    laps: session.lapsData,
    poolLengthMeters: session.poolLengthMeters,
    perceivedFatigue: session.perceivedFatigue,
    fatigue: session.fatigue,
    breathingDifficulty: session.breathingDifficulty,
    breathFeeling: session.breathFeeling,
    gymBeforeSession: session.gymBeforeSession,
    moodBefore: session.moodBefore,
    moodAfter: session.moodAfter,
    notes: session.notes
  });
  const narrative = generateSessionNarrative({
    distanceMeters,
    totalTimeMinutes: session.totalTimeMinutes,
    moodBefore: session.moodBefore,
    moodAfter: session.moodAfter,
    notes: session.notes,
    analysis
  });
  const geoProgress = calculateVirtualProgress({
    start: input.userHomeCoords ?? defaultStartCoords,
    distanceMeters,
    milestones: (sampleRoutes[0] as SymbolicRoute | undefined)?.milestones
  });
  const ranked = buildRankedBreakdown(analysis);
  const personalRoute = findPersonalRoute(distanceMeters, input.routes ?? []);
  const seedRoute = calculateSymbolicRouteProgress(distanceMeters, sampleRoutes[0] as SymbolicRoute);

  return {
    analysis,
    narrative,
    geoProgress,
    ranked,
    routeProgress: personalRoute ?? seedRoute
  };
}

function findPersonalRoute(distanceMeters: number, routes: DistanceRoute[]) {
  const route = routes.find((item) => item.isFavorite) ?? routes[0];
  if (!route) return null;
  return calculateSymbolicRouteProgress(distanceMeters, {
    name: route.name,
    totalDistanceMeters: route.distanceMeters
  });
}
