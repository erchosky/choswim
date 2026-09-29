import { describe, expect, it } from 'vitest';
import { challengePercent, calculateChallengeProgress, isChallengeCompleted } from '../domain/challenges/challengeEngine';
import type { Challenge, SwimSession } from '../types/models';

const challenge: Challenge = {
  id: 'c1',
  title: '5k',
  description: 'Nada 5k',
  type: 'weekly',
  targetMetric: 'distance',
  targetValue: 5000,
  startDate: new Date(),
  endDate: new Date(),
  rewardXP: 100,
  status: 'active',
  difficulty: 'medium',
  createdBy: 'system',
  visibility: 'global'
};

const sessions = [
  { totalDistanceMeters: 1200, activeTimeMinutes: 30, pacePer100m: 150, xpGained: 80, consistencyScore: 30 },
  { totalDistanceMeters: 1800, activeTimeMinutes: 40, pacePer100m: 140, xpGained: 100, consistencyScore: 60 }
] as SwimSession[];

describe('challenge engine', () => {
  it('calculates distance progress', () => {
    const current = calculateChallengeProgress(challenge, sessions);
    expect(current).toBe(3000);
    expect(challengePercent(current, challenge.targetValue)).toBe(60);
    expect(isChallengeCompleted(current, challenge.targetValue)).toBe(false);
  });
});
