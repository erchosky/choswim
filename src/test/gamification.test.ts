import { describe, expect, it } from 'vitest';
import { evaluateTrophies, getPersonalRecords } from '../domain/gamification/achievements';
import { getBossProgress, getWeeklyBoss } from '../domain/gamification/bosses';
import { getAccountLevel } from '../domain/gamification/levels';
import type { SwimSession } from '../types/models';

const sessions = [
  { totalDistanceMeters: 1200, pacePer100m: 150, waterWeights: 'none', sessionScore: 82, date: new Date(), xpGained: 100 },
  { totalDistanceMeters: 800, pacePer100m: 142, waterWeights: 'light', sessionScore: 76, date: new Date(), xpGained: 80 },
  { totalDistanceMeters: 1600, pacePer100m: 138, waterWeights: 'none', sessionScore: 90, date: new Date(), xpGained: 130 },
  { totalDistanceMeters: 1500, pacePer100m: 132, waterWeights: 'none', sessionScore: 88, date: new Date(), xpGained: 120 }
] as SwimSession[];

describe('gamification', () => {
  it('evaluates trophies with progress', () => {
    const trophies = evaluateTrophies({ sessions, weeklyMeters: 5100, streakDays: 7 });
    expect(trophies.find((trophy) => trophy.id === 'first-session')?.unlocked).toBe(true);
    expect(trophies.find((trophy) => trophy.id === 'weekly-5k')?.unlocked).toBe(true);
    expect(trophies.find((trophy) => trophy.id === 'streak-7')?.progressPercent).toBe(100);
  });

  it('computes records and levels', () => {
    expect(getPersonalRecords(sessions).bestDistance).toBe(1600);
    expect(getAccountLevel(2500).level).toBeGreaterThan(1);
  });

  it('computes weekly boss progress', () => {
    const boss = getWeeklyBoss(5000);
    expect(boss.name).toBe('Kraken');
    expect(getBossProgress(2500, boss).progressPercent).toBe(50);
  });
});
