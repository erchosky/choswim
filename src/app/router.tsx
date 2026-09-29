import { Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from '../components/layout/AppShell';
import { AuthLayout } from '../components/layout/AuthLayout';
import { LoadingState } from '../components/ui/States';
import { RedirectIfAuthed, RequireAdmin, RequireAuth } from './guards';
import {
  AchievementsPage,
  AdminPage,
  AiCoachPage,
  ChallengesPage,
  DashboardPage,
  DistanceRoutesPage,
  ImportsPage,
  LeaderboardPage,
  LoginPage,
  NewSessionPage,
  OnboardingPage,
  PlansPage,
  ProfilePage,
  RankedPage,
  RegisterPage,
  SessionDetailPage,
  SessionRewardPage,
  SessionsPage,
  WorkoutLibraryPage
} from './pages';

function lazyPage(page: ReactNode) {
  return <Suspense fallback={<LoadingState />}>{page}</Suspense>;
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    element: <RedirectIfAuthed />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: lazyPage(<LoginPage />) },
          { path: '/register', element: lazyPage(<RegisterPage />) }
        ]
      }
    ]
  },
  {
    element: <RequireAuth />,
    children: [
      { path: '/onboarding', element: lazyPage(<OnboardingPage />) },
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: lazyPage(<DashboardPage />) },
          { path: '/sessions', element: lazyPage(<SessionsPage />) },
          { path: '/sessions/new', element: lazyPage(<NewSessionPage />) },
          { path: '/sessions/:id/reward', element: lazyPage(<SessionRewardPage />) },
          { path: '/sessions/:id', element: lazyPage(<SessionDetailPage />) },
          { path: '/challenges', element: lazyPage(<ChallengesPage />) },
          { path: '/ranked', element: lazyPage(<RankedPage />) },
          { path: '/achievements', element: lazyPage(<AchievementsPage />) },
          { path: '/leaderboard', element: lazyPage(<LeaderboardPage />) },
          { path: '/plans', element: lazyPage(<PlansPage />) },
          { path: '/workouts', element: lazyPage(<WorkoutLibraryPage />) },
          { path: '/ai-coach', element: lazyPage(<AiCoachPage />) },
          { path: '/profile', element: lazyPage(<ProfilePage />) },
          { path: '/imports', element: lazyPage(<ImportsPage />) },
          { path: '/distance-routes', element: lazyPage(<DistanceRoutesPage />) },
          {
            element: <RequireAdmin />,
            children: [{ path: '/admin', element: lazyPage(<AdminPage />) }]
          }
        ]
      }
    ]
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> }
]);
