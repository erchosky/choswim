import type { SwimSession } from '../../types/models';

export function pacePer100m(distanceMeters: number, activeTimeMinutes: number): number {
  if (distanceMeters <= 0 || activeTimeMinutes <= 0) return 0;
  return Number(((activeTimeMinutes * 60) / (distanceMeters / 100)).toFixed(1));
}

export function formatPace(secondsPer100m: number): string {
  if (!secondsPer100m || secondsPer100m <= 0) return '--';
  const minutes = Math.floor(secondsPer100m / 60);
  const seconds = Math.round(secondsPer100m % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}/100m`;
}

export function estimateCalories(input: {
  distanceMeters: number;
  activeTimeMinutes: number;
  weightKg: number;
  intensity: number;
  waterWeights?: string;
}): number {
  const met = 5.8 + input.intensity * 0.42 + (input.waterWeights && input.waterWeights !== 'none' ? 1.1 : 0);
  const hours = input.activeTimeMinutes / 60;
  const distanceFactor = Math.max(0.75, input.distanceMeters / Math.max(1, input.activeTimeMinutes * 35));
  return Math.round(met * input.weightKg * hours * distanceFactor);
}

export function sessionScore(session: Pick<SwimSession, 'totalDistanceMeters' | 'activeTimeMinutes' | 'intensity' | 'perceivedEffort' | 'restTimeMinutes'>): number {
  const distanceScore = Math.min(40, session.totalDistanceMeters / 75);
  const activeScore = Math.min(25, session.activeTimeMinutes * 0.8);
  const intensityScore = Math.min(20, session.intensity * 2);
  const efficiencyPenalty = Math.max(0, session.restTimeMinutes - session.activeTimeMinutes * 0.35) * 0.25;
  const effortBalance = Math.max(0, 10 - Math.abs(session.intensity - session.perceivedEffort));
  return Math.max(0, Math.min(100, Math.round(distanceScore + activeScore + intensityScore + effortBalance - efficiencyPenalty)));
}

export function consistencyScore(recentSessionCount: number, weeklyTargetSessions = 3): number {
  return Math.min(100, Math.round((recentSessionCount / weeklyTargetSessions) * 100));
}
