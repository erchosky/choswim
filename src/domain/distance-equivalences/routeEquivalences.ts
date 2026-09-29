import type { DistanceRoute } from '../../types/models';

export interface RouteProgress {
  routeName: string;
  progressPercent: number;
  timesCompleted: number;
  remainingMeters: number;
  phrase: string;
}

export function calculateRouteProgress(distanceMeters: number, routeDistanceMeters: number) {
  const safeDistance = Math.max(0, distanceMeters);
  const safeRouteDistance = Math.max(1, routeDistanceMeters);
  const rawTimes = safeDistance / safeRouteDistance;
  const timesCompleted = safeDistance >= safeRouteDistance ? Number(rawTimes.toFixed(1)) : 0;
  const progressPercent = Math.min(100, Math.round(rawTimes * 100));
  const remainingMeters = Math.max(0, Math.ceil(safeRouteDistance - safeDistance));

  return {
    progressPercent,
    timesCompleted,
    remainingMeters
  };
}

export function formatRouteEquivalent(distanceMeters: number, route: DistanceRoute): RouteProgress {
  const progress = calculateRouteProgress(distanceMeters, route.distanceMeters);
  const routeLabel = route.name || `${route.fromLabel} -> ${route.toLabel}`;

  if (progress.timesCompleted >= 2) {
    return {
      routeName: routeLabel,
      ...progress,
      phrase: `Has hecho ${progress.timesCompleted.toLocaleString('es-ES')} vueltas a ${routeLabel}.`
    };
  }

  if (progress.timesCompleted >= 1) {
    return {
      routeName: routeLabel,
      ...progress,
      phrase: `Has nadado como ir de ${route.fromLabel} a ${route.toLabel}.`
    };
  }

  return {
    routeName: routeLabel,
    ...progress,
    phrase: `Has completado el ${progress.progressPercent}% de ${routeLabel}. Te faltan ${progress.remainingMeters.toLocaleString('es-ES')}m.`
  };
}

export function getBestMatchingRoutes(distanceMeters: number, routes: DistanceRoute[], limit = 3): RouteProgress[] {
  return routes
    .filter((route) => route.distanceMeters > 0)
    .map((route) => formatRouteEquivalent(distanceMeters, route))
    .sort((a, b) => {
      const aScore = scoreMatch(a);
      const bScore = scoreMatch(b);
      return bScore - aScore;
    })
    .slice(0, limit);
}

export function getWeeklyRouteSummary(totalWeeklyMeters: number, routes: DistanceRoute[]): RouteProgress | null {
  const favoriteRoutes = routes.filter((route) => route.isFavorite);
  const candidates = favoriteRoutes.length ? favoriteRoutes : routes;
  return getBestMatchingRoutes(totalWeeklyMeters, candidates, 1)[0] ?? null;
}

function scoreMatch(progress: RouteProgress): number {
  if (progress.timesCompleted >= 1) {
    return 1000 - Math.abs(progress.timesCompleted - 1) * 100;
  }

  return progress.progressPercent;
}
