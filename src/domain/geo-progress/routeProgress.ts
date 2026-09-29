import type { SymbolicRoute } from './types';

export function calculateSymbolicRouteProgress(distanceMeters: number, route: Pick<SymbolicRoute, 'name' | 'totalDistanceMeters'>) {
  const total = Math.max(1, route.totalDistanceMeters);
  const progressPercent = Math.min(100, Math.round((Math.max(0, distanceMeters) / total) * 100));
  return {
    routeName: route.name,
    progressPercent,
    remainingMeters: Math.max(0, Math.ceil(total - distanceMeters)),
    completed: distanceMeters >= total
  };
}
