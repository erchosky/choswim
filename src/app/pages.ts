import { lazy } from 'react';

/** Páginas cargadas bajo demanda: cada una genera su propio chunk. */
export const LoginPage = lazy(() => import('../features/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
export const RegisterPage = lazy(() => import('../features/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })));
export const OnboardingPage = lazy(() => import('../features/onboarding/OnboardingPage').then((module) => ({ default: module.OnboardingPage })));
export const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })));
export const SessionsPage = lazy(() => import('../features/sessions/SessionsPage').then((module) => ({ default: module.SessionsPage })));
export const NewSessionPage = lazy(() => import('../features/sessions/NewSessionPage').then((module) => ({ default: module.NewSessionPage })));
export const SessionDetailPage = lazy(() => import('../features/sessions/SessionDetailPage').then((module) => ({ default: module.SessionDetailPage })));
export const SessionRewardPage = lazy(() => import('../features/sessions/SessionRewardPage').then((module) => ({ default: module.SessionRewardPage })));
export const ChallengesPage = lazy(() => import('../features/challenges/ChallengesPage').then((module) => ({ default: module.ChallengesPage })));
export const RankedPage = lazy(() => import('../features/ranked/RankedPage').then((module) => ({ default: module.RankedPage })));
export const LeaderboardPage = lazy(() => import('../features/leaderboard/LeaderboardPage').then((module) => ({ default: module.LeaderboardPage })));
export const PlansPage = lazy(() => import('../features/plans/PlansPage').then((module) => ({ default: module.PlansPage })));
export const AiCoachPage = lazy(() => import('../features/ai-coach/AiCoachPage').then((module) => ({ default: module.AiCoachPage })));
export const ProfilePage = lazy(() => import('../features/profile/ProfilePage').then((module) => ({ default: module.ProfilePage })));
export const AdminPage = lazy(() => import('../features/admin/AdminPage').then((module) => ({ default: module.AdminPage })));
export const ImportsPage = lazy(() => import('../features/imports/ImportsPage').then((module) => ({ default: module.ImportsPage })));
export const DistanceRoutesPage = lazy(() => import('../features/distance-equivalences/DistanceRoutesPage').then((module) => ({ default: module.DistanceRoutesPage })));
export const WorkoutLibraryPage = lazy(() => import('../features/workouts/WorkoutLibraryPage').then((module) => ({ default: module.WorkoutLibraryPage })));
export const AchievementsPage = lazy(() => import('../features/achievements/AchievementsPage').then((module) => ({ default: module.AchievementsPage })));
