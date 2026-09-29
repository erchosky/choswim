import type { SwimSession } from '../../types/models';

export interface XpInput {
  distanceMeters: number;
  activeTimeMinutes: number;
  intensity: number;
  perceivedEffort: number;
  previousBestDistance?: number;
  previousBestPace?: number;
  pacePer100m?: number;
  streakDays?: number;
  completedChallengeXP?: number;
  dataQualityPenalty?: boolean;
}

export interface XpBreakdown {
  total: number;
  base: number;
  intensityBonus: number;
  completionBonus: number;
  personalRecordBonus: number;
  streakBonus: number;
  challengeBonus: number;
  penalty: number;
}

export function calculateXP(input: XpInput): XpBreakdown {
  const base = Math.round(input.distanceMeters / 20 + input.activeTimeMinutes * 1.5);
  const intensityBonus = Math.round(base * Math.min(0.3, Math.max(0, input.intensity - 4) * 0.04));
  const completionBonus = input.distanceMeters >= 1000 && input.activeTimeMinutes >= 25 ? 35 : input.distanceMeters >= 500 ? 15 : 0;
  const distancePR = input.previousBestDistance ? input.distanceMeters > input.previousBestDistance : false;
  const pacePR = input.previousBestPace && input.pacePer100m ? input.pacePer100m < input.previousBestPace : false;
  const personalRecordBonus = distancePR || pacePR ? 60 : 0;
  const streakBonus = Math.min(80, Math.max(0, input.streakDays ?? 0) * 8);
  const challengeBonus = input.completedChallengeXP ?? 0;
  const incoherentEffort = Math.abs(input.intensity - input.perceivedEffort) >= 6;
  const penalty = input.dataQualityPenalty || incoherentEffort ? Math.round(base * 0.18) : 0;
  const total = Math.max(5, base + intensityBonus + completionBonus + personalRecordBonus + streakBonus + challengeBonus - penalty);

  return {
    total,
    base,
    intensityBonus,
    completionBonus,
    personalRecordBonus,
    streakBonus,
    challengeBonus,
    penalty
  };
}

export function getBestDistance(sessions: Pick<SwimSession, 'totalDistanceMeters'>[]): number {
  return Math.max(0, ...sessions.map((session) => session.totalDistanceMeters));
}

export function getBestPace(sessions: Pick<SwimSession, 'pacePer100m'>[]): number | undefined {
  const valid = sessions.map((session) => session.pacePer100m).filter((pace) => pace > 0);
  return valid.length ? Math.min(...valid) : undefined;
}
