import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'admin';
export type ThemePreference = 'dark' | 'light' | 'system';
export type MainGoal = 'fat_loss' | 'muscle_gain' | 'endurance' | 'speed' | 'technique' | 'general';
export type SessionGoal = MainGoal | 'recovery';
export type SwimLevel = 'beginner' | 'intermediate' | 'advanced';
export type PoolLength = 20 | 25 | 50;
export type SwimStyle = 'freestyle' | 'breaststroke' | 'backstroke' | 'butterfly' | 'mixed' | 'drills';
export type WaterWeights = 'none' | 'light' | 'medium' | 'heavy';
export type SwimSessionSource = 'manual' | 'apple_health';
export type ChallengeType = 'daily' | 'weekly' | 'monthly' | 'cumulative' | 'boss' | 'location_distance' | 'friend_duel';
export type ChallengeMetric = 'distance' | 'sessions' | 'time' | 'pace' | 'streak' | 'xp';
export type ChallengeStatus = 'draft' | 'active' | 'completed' | 'failed' | 'archived';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'boss';
export type Visibility = 'private' | 'friends' | 'global';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  heightCm: number;
  weightKg: number;
  birthYear?: number;
  mainGoal: MainGoal;
  poolLengthMeters: PoolLength;
  level: SwimLevel;
  weeklyTargetMeters: number;
  preferredSessionDuration: number;
  usesWaterWeights: boolean;
  profileCompleted: boolean;
  themePreference?: ThemePreference;
  xp: number;
  streakDays: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  // Agregados que mantienen las Cloud Functions sobre TODAS las sesiones (el cliente solo carga las últimas).
  sessionCount?: number;
  totalMeters?: number;
  totalActiveMinutes?: number;
  bestDistance?: number;
  bestPace?: number;
  weeklyMeters?: number;
  weeklyXP?: number;
  weeklySessionCount?: number;
  rankName?: string;
}

export interface SwimSession {
  id: string;
  userId: string;
  source?: SwimSessionSource;
  healthKitWorkoutUUID?: string;
  date: Timestamp | Date | string;
  startDate?: Timestamp | Date | string;
  endDate?: Timestamp | Date | string;
  poolLengthMeters: PoolLength;
  totalDistanceMeters: number;
  totalTimeMinutes: number;
  activeTimeMinutes: number;
  restTimeMinutes: number;
  laps: number;
  style: SwimStyle;
  intensity: number;
  perceivedEffort: number;
  waterWeights: WaterWeights;
  goal: SessionGoal;
  notes?: string;
  moodBefore?: string;
  moodAfter?: string;
  fatigue?: number;
  perceivedFatigue?: number;
  breathingDifficulty?: number;
  painNotes?: string;
  breathFeeling?: string;
  activeEnergyKcal?: number;
  totalEnergyKcal?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgSwolf?: number;
  bestSwolf?: number;
  worstSwolf?: number;
  gymBeforeSession?: boolean;
  swimmingLocationType?: string;
  lapsData?: Array<{ swolf?: number; splitSeconds?: number; distanceMeters?: number }>;
  pacePer100m: number;
  estimatedCalories: number;
  xpGained: number;
  computedXP?: number;
  computedStats?: {
    pacePer100m: number;
    estimatedCalories: number;
    sessionScore: number;
    consistencyScore: number;
  };
  processedAt?: Timestamp | Date;
  processingVersion?: number;
  processingStatus?: 'pending' | 'processed' | 'failed';
  analysis?: unknown;
  narrative?: unknown;
  geoProgress?: unknown;
  rankedBreakdown?: unknown;
  badgesUnlocked?: string[];
  challengeProgress?: unknown;
  sessionScore: number;
  consistencyScore: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  targetMetric: ChallengeMetric;
  targetValue: number;
  currentValue?: number;
  startDate: Timestamp | Date | string;
  endDate: Timestamp | Date | string;
  rewardXP: number;
  status: ChallengeStatus;
  difficulty: ChallengeDifficulty;
  createdBy: string;
  visibility: Visibility;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  currentValue: number;
  status: ChallengeStatus;
  completedAt?: Timestamp | Date;
}

export interface TrainingPlan {
  id: string;
  title: string;
  objective: MainGoal | 'recovery';
  durationWeeks: number;
  sessionsPerWeek: number;
  difficulty: SwimLevel;
  progression: string[];
  sessions: Array<{
    title: string;
    warmup: string;
    main: string;
    cooldown: string;
  }>;
}

export interface LocationSymbol {
  id: string;
  userId: string;
  name: string;
  distanceMeters: number;
  category: 'home' | 'pool' | 'shop' | 'park' | 'square' | 'other';
}

export type DistanceRouteCategory = 'personal' | 'city' | 'challenge' | 'funny';

export interface DistanceRoute {
  id: string;
  userId: string;
  name: string;
  fromLabel: string;
  toLabel: string;
  distanceMeters: number;
  category: DistanceRouteCategory;
  isFavorite: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  weeklyMeters: number;
  weeklyXP: number;
  sessions: number;
  streak: number;
  bestPace: number;
  challengesCompleted: number;
  improvement: number;
}
