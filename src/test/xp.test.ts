import { describe, expect, it } from 'vitest';
import { calculateXP } from '../domain/xp/xpEngine';

describe('xp engine', () => {
  it('rewards distance, intensity, streak and PRs', () => {
    const xp = calculateXP({
      distanceMeters: 1800,
      activeTimeMinutes: 42,
      intensity: 8,
      perceivedEffort: 8,
      previousBestDistance: 1500,
      previousBestPace: 150,
      pacePer100m: 145,
      streakDays: 3
    });

    expect(xp.total).toBeGreaterThan(xp.base);
    expect(xp.personalRecordBonus).toBe(60);
    expect(xp.streakBonus).toBe(24);
  });

  it('applies a soft penalty for incoherent effort data', () => {
    const xp = calculateXP({
      distanceMeters: 1000,
      activeTimeMinutes: 30,
      intensity: 10,
      perceivedEffort: 2
    });

    expect(xp.penalty).toBeGreaterThan(0);
  });
});
