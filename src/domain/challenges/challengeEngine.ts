import type { Challenge, LeaderboardEntry, SwimSession } from '../../types/models';

export function calculateChallengeProgress(challenge: Challenge, sessions: SwimSession[], leaderboard?: LeaderboardEntry[]): number {
  switch (challenge.targetMetric) {
    case 'distance':
      return sessions.reduce((sum, session) => sum + session.totalDistanceMeters, 0);
    case 'sessions':
      return sessions.length;
    case 'time':
      return sessions.reduce((sum, session) => sum + session.activeTimeMinutes, 0);
    case 'pace': {
      const paces = sessions.map((session) => session.pacePer100m).filter(Boolean);
      if (!paces.length) return 0;
      const best = Math.min(...paces);
      return Math.max(0, challenge.targetValue - best);
    }
    case 'streak':
      return Math.max(0, ...sessions.map((session) => session.consistencyScore));
    case 'xp':
      return sessions.reduce((sum, session) => sum + session.xpGained, 0);
    default:
      return leaderboard?.length ?? 0;
  }
}

export function challengePercent(currentValue: number, targetValue: number): number {
  if (targetValue <= 0) return 0;
  return Math.min(100, Math.round((currentValue / targetValue) * 100));
}

export function isChallengeCompleted(currentValue: number, targetValue: number): boolean {
  return currentValue >= targetValue;
}
