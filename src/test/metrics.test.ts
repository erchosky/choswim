import { describe, expect, it } from 'vitest';
import { estimateCalories, formatPace, pacePer100m, sessionScore } from '../domain/swimming/metrics';

describe('swimming metrics', () => {
  it('calculates pace per 100m', () => {
    expect(pacePer100m(1000, 20)).toBe(120);
    expect(formatPace(125)).toBe('2:05/100m');
  });

  it('estimates calories and session score', () => {
    expect(estimateCalories({ distanceMeters: 1200, activeTimeMinutes: 35, weightKg: 80, intensity: 7 })).toBeGreaterThan(250);
    expect(sessionScore({ totalDistanceMeters: 1200, activeTimeMinutes: 35, intensity: 7, perceivedEffort: 7, restTimeMinutes: 8 })).toBeGreaterThan(50);
  });
});
