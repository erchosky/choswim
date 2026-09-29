import { describe, expect, it } from 'vitest';
import { generateDailyMission } from '../domain/gamification/dailyMissions';
import { buildPostSessionReward } from '../domain/gamification/postSessionRewards';
import { calculateTrainingStreak } from '../domain/gamification/streaks';
import type { DistanceRoute, SwimSession, UserProfile } from '../types/models';

const today = new Date('2026-05-12T10:00:00');
const yesterday = new Date('2026-05-11T10:00:00');

const session = {
  id: 's1',
  userId: 'u1',
  date: today,
  totalDistanceMeters: 1000,
  totalTimeMinutes: 40,
  activeTimeMinutes: 30,
  restTimeMinutes: 10,
  poolLengthMeters: 25,
  laps: 40,
  style: 'mixed',
  intensity: 6,
  perceivedEffort: 6,
  waterWeights: 'none',
  goal: 'endurance',
  pacePer100m: 180,
  estimatedCalories: 300,
  xpGained: 120,
  sessionScore: 80,
  consistencyScore: 80,
  createdAt: today,
  updatedAt: today
} as SwimSession;

const route = {
  id: 'r1',
  userId: 'u1',
  name: 'Casa -> Piscina',
  fromLabel: 'Casa',
  toLabel: 'Piscina',
  distanceMeters: 1000,
  category: 'personal',
  isFavorite: true,
  createdAt: today,
  updatedAt: today
} as DistanceRoute;

const profile = {
  uid: 'u1',
  displayName: 'Chosky',
  email: 'c@example.com',
  role: 'user',
  heightCm: 180,
  weightKg: 80,
  mainGoal: 'endurance',
  poolLengthMeters: 25,
  level: 'intermediate',
  weeklyTargetMeters: 5000,
  preferredSessionDuration: 45,
  usesWaterWeights: false,
  profileCompleted: true,
  xp: 1000,
  streakDays: 2,
  createdAt: today,
  updatedAt: today
} as UserProfile;

describe('streaks, missions and post-session rewards', () => {
  it('detects active streak and risk state', () => {
    const current = calculateTrainingStreak([{ date: today }, { date: yesterday }], today);
    expect(current.streakDays).toBe(2);
    expect(current.trainedToday).toBe(true);

    const atRisk = calculateTrainingStreak([{ date: yesterday }], today);
    expect(atRisk.atRisk).toBe(true);
  });

  it('generates a daily mission from goal and load', () => {
    const mission = generateDailyMission({
      mainGoal: 'endurance',
      level: 'intermediate',
      sessionsWeek: 0,
      weeklyMeters: 0,
      weeklyTargetMeters: 5000,
      favoriteRoute: route
    });

    expect(mission.targetMeters).toBeGreaterThan(0);
    expect(mission.rewardXP).toBeGreaterThan(0);
  });

  it('builds post-session rewards', () => {
    const reward = buildPostSessionReward({
      session,
      previousSessions: [],
      profile,
      routes: [route],
      weeklyMeters: 1000
    });

    expect(reward.xpGained).toBe(120);
    expect(reward.equivalentPhrase).toContain('Casa');
    expect(reward.personalRecords.length).toBeGreaterThan(0);
  });
});
