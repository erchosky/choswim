import { describe, expect, it } from 'vitest';
import { calculateXP as calculateServerXP, getRankName } from '../../functions/src/stats/calculations';
import { getRankForXP } from '../domain/ranks/ranks';
import { calculateXP } from '../domain/xp/xpEngine';

/** La web muestra estimaciones; el XP oficial lo calculan las Cloud Functions. Deben coincidir. */
describe('paridad cliente/servidor', () => {
  const cases = [
    { distanceMeters: 500, activeTimeMinutes: 20, intensity: 3, perceivedEffort: 3 },
    { distanceMeters: 1500, activeTimeMinutes: 45, intensity: 8, perceivedEffort: 8, previousBestDistance: 1200, streakDays: 4 },
    { distanceMeters: 1000, activeTimeMinutes: 30, intensity: 9, perceivedEffort: 2, pacePer100m: 170, previousBestPace: 180 },
    { distanceMeters: 50, activeTimeMinutes: 2, intensity: 1, perceivedEffort: 1, streakDays: 20 }
  ];

  it.each(cases)('mismo XP para %o', (input) => {
    expect(calculateXP(input).total).toBe(calculateServerXP(input));
  });

  it.each([0, 999, 1000, 2500, 9000, 24000, 40000, 100000])('mismo rango para %i XP', (xp) => {
    expect(getRankForXP(xp).name).toBe(getRankName(xp));
  });
});
