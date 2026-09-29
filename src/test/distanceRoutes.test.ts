import { describe, expect, it } from 'vitest';
import { calculateRouteProgress, formatRouteEquivalent, getBestMatchingRoutes, getWeeklyRouteSummary } from '../domain/distance-equivalences/routeEquivalences';
import type { DistanceRoute } from '../types/models';
import { mergeWithDefaultRoutes } from '../services/distanceRouteService';

const route: DistanceRoute = {
  id: 'r1',
  userId: 'u1',
  name: 'Casa -> Piscina',
  fromLabel: 'Casa',
  toLabel: 'Piscina',
  distanceMeters: 1000,
  category: 'personal',
  isFavorite: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const routes: DistanceRoute[] = [
  route,
  { ...route, id: 'r2', name: 'Casa -> Gimnasio', toLabel: 'Gimnasio', distanceMeters: 2400, isFavorite: false },
  { ...route, id: 'r3', name: 'Cruzar el Estrecho', fromLabel: 'Marruecos', toLabel: 'España', distanceMeters: 14400, isFavorite: false }
];

describe('distance route equivalences', () => {
  it('calculates progress when distance is lower than route', () => {
    expect(calculateRouteProgress(730, 1000)).toEqual({ progressPercent: 73, timesCompleted: 0, remainingMeters: 270 });
    expect(formatRouteEquivalent(730, route).phrase).toContain('73%');
  });

  it('calculates exact route completion', () => {
    const result = formatRouteEquivalent(1000, route);
    expect(result.progressPercent).toBe(100);
    expect(result.timesCompleted).toBe(1);
    expect(result.remainingMeters).toBe(0);
  });

  it('calculates distance greater than route', () => {
    const result = formatRouteEquivalent(1500, route);
    expect(result.timesCompleted).toBe(1.5);
    expect(result.phrase).toContain('Casa');
  });

  it('formats multiple laps', () => {
    const result = formatRouteEquivalent(2400, route);
    expect(result.timesCompleted).toBe(2.4);
    expect(result.phrase).toContain('2,4 vueltas');
  });

  it('selects best matching route', () => {
    const [best] = getBestMatchingRoutes(1000, routes);
    expect(best.routeName).toBe('Casa -> Piscina');
  });

  it('returns weekly summary using favorite route first', () => {
    const summary = getWeeklyRouteSummary(3000, routes);
    expect(summary?.routeName).toBe('Casa -> Piscina');
    expect(summary?.timesCompleted).toBe(3);
  });

  it('keeps built-in routes when a user creates a personal route', () => {
    const merged = mergeWithDefaultRoutes([route]);
    expect(merged).toContainEqual(route);
    expect(merged.some((item) => item.userId === 'global')).toBe(true);
    expect(new Set(merged.map((item) => item.id)).size).toBe(merged.length);
  });
});
