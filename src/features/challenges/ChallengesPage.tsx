import { Trophy } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ErrorBanner, LoadingState } from '../../components/ui/States';
import { BASE_CHALLENGES } from '../../domain/challenges/baseChallenges';
import { calculateChallengeProgress, challengePercent } from '../../domain/challenges/challengeEngine';
import { DEFAULT_DISTANCE_ROUTES } from '../../domain/distance-equivalences/baseRoutes';
import { getBestMatchingRoutes } from '../../domain/distance-equivalences/routeEquivalences';
import { useDistanceRoutes, useUserSessions, useVisibleChallenges } from '../../services/queries';
import { challengeDifficultyLabels } from '../../shared/constants/labels';
import { useAuthStore } from '../../store/authStore';

export function ChallengesPage() {
  const { profile } = useAuthStore();
  const sessionsQuery = useUserSessions(profile?.uid);
  const challengesQuery = useVisibleChallenges(profile?.uid);
  const routesQuery = useDistanceRoutes(profile?.uid);
  const sessions = sessionsQuery.data ?? [];
  // Sin retos publicados en Firestore (o si falla la carga) se muestran los retos base.
  const challenges = challengesQuery.data?.length ? challengesQuery.data : BASE_CHALLENGES;
  const routes = routesQuery.data?.length ? routesQuery.data : DEFAULT_DISTANCE_ROUTES;

  if (sessionsQuery.isPending || challengesQuery.isPending || routesQuery.isPending) return <LoadingState />;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase text-app-accent">Retos</p>
        <h1 className="mt-1 text-3xl font-black text-app-text">Misiones ranked</h1>
      </header>
      <ErrorBanner error={sessionsQuery.error} fallback="No se pudieron cargar las sesiones." />
      <ErrorBanner error={challengesQuery.error} fallback="No se pudieron cargar los retos." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {challenges.map((challenge) => {
          const current = calculateChallengeProgress(challenge, sessions);
          const percent = challengePercent(current, challenge.targetValue);
          const routeTarget = challenge.type === 'location_distance' ? getBestMatchingRoutes(challenge.targetValue, routes, 1)[0] : null;
          return (
            <Card key={challenge.id}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-app-text">{challenge.title}</h2>
                  <p className="mt-1 text-sm text-app-muted">{challenge.description}</p>
                </div>
                <div className="rounded-lg bg-app-accent/12 p-2 text-app-accent"><Trophy size={20} /></div>
              </div>
              {routeTarget ? <p className="mb-3 rounded-lg border border-app-line bg-app-bg/45 p-3 text-sm text-app-muted">Objetivo por ruta: {routeTarget.phrase}</p> : null}
              <ProgressBar value={percent} label={`${Math.round(current)} / ${challenge.targetValue} ${challenge.targetMetric}`} />
              <div className="mt-4 flex gap-2"><Badge>{challengeDifficultyLabels[challenge.difficulty]}</Badge><Badge>+{challenge.rewardXP} XP</Badge></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
