import { destinationPoint } from './geoUtils';
import { findNextMilestone } from './nearbyMilestones';
import type { GeoPoint, SymbolicMilestone, VirtualProgressOutput } from './types';

export function calculateVirtualProgress(input: {
  start: GeoPoint;
  distanceMeters: number;
  bearingDegrees?: number;
  milestones?: SymbolicMilestone[];
}): VirtualProgressOutput {
  const distanceMeters = Math.max(0, input.distanceMeters);
  const bearing = input.bearingDegrees ?? 70;
  const virtualPoint = destinationPoint(input.start, distanceMeters, bearing);
  const milestone = findNextMilestone(distanceMeters, input.milestones);

  return {
    start: input.start,
    distanceMeters,
    virtualPoint,
    message: `Hoy has nadado lo equivalente a alejarte ${distanceMeters.toLocaleString('es-ES')}m de tu punto inicial.`,
    milestone
  };
}
