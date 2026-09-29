import { describe, expect, it } from 'vitest';
import { aggregateStats } from '../domain/stats/userStats';
import type { SwimSession } from '../types/models';

describe('aggregateStats', () => {
  it('returns the fastest positive pace instead of zero', () => {
    const sessions = [
      { pacePer100m: 150, totalDistanceMeters: 1000, activeTimeMinutes: 25, xpGained: 20, date: new Date() },
      { pacePer100m: 132, totalDistanceMeters: 800, activeTimeMinutes: 18, xpGained: 15, date: new Date() },
      { pacePer100m: 0, totalDistanceMeters: 500, activeTimeMinutes: 0, xpGained: 5, date: new Date() }
    ] as SwimSession[];

    expect(aggregateStats(sessions).bestPace).toBe(132);
  });

  it('uses zero when no valid pace exists', () => {
    expect(aggregateStats([]).bestPace).toBe(0);
  });
});
