import { Link, useParams } from 'react-router';
import { Award, BadgeCheck, Medal, Route, Sparkles, Trophy } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingState } from '../../components/ui/States';
import { DEFAULT_DISTANCE_ROUTES } from '../../domain/distance-equivalences/baseRoutes';
import { buildPostSessionReward } from '../../domain/gamification/postSessionRewards';
import { aggregateStats } from '../../domain/stats/userStats';
import { isProcessed, useDistanceRoutes, useProcessedSession, useUserSessions } from '../../services/queries';
import { toVisibleError } from '../../shared/utils/async';
import { useAuthStore } from '../../store/authStore';
import { BreathingInsightCard } from '../session-meaning/components/BreathingInsightCard';
import { CoachInsightCard } from '../session-meaning/components/CoachInsightCard';
import { GeoProgressCard } from '../session-meaning/components/GeoProgressCard';
import { RankedProgressCard } from '../session-meaning/components/RankedProgressCard';
import { SessionMeaningCard } from '../session-meaning/components/SessionMeaningCard';

export function SessionRewardPage() {
  const { id } = useParams();
  const { profile } = useAuthStore();
  const sessionQuery = useProcessedSession(id);
  const sessionsQuery = useUserSessions(profile?.uid);
  const routesQuery = useDistanceRoutes(profile?.uid);
  const session = sessionQuery.data;
  const routes = routesQuery.data?.length ? routesQuery.data : DEFAULT_DISTANCE_ROUTES;
  const processed = isProcessed(session);
  const stillProcessing = !processed && !sessionQuery.processingTimedOut;

  if (!profile || sessionQuery.isPending || stillProcessing) return <LoadingState label="Calculando recompensa..." />;
  if (!session || sessionQuery.error) {
    return (
      <Card>
        <p className="text-app-danger">{sessionQuery.error ? toVisibleError(sessionQuery.error, 'No se pudo cargar el resumen post-entreno.') : 'No se encontró la sesión.'}</p>
        <Link className="mt-3 inline-block text-app-accent" to="/sessions">Volver a sesiones</Link>
      </Card>
    );
  }

  const previousSessions = (sessionsQuery.data ?? []).filter((item) => item.id !== id);
  const stats = aggregateStats([session, ...previousSessions]);
  const reward = buildPostSessionReward({ session, previousSessions, profile, routes, weeklyMeters: stats.metersWeek });

  return (
    <div className="space-y-5">
      {!processed ? (
        <Card><p className="text-sm text-app-muted">El servidor todavía está calculando el XP oficial de esta sesión. Los datos se actualizarán en unos segundos en el detalle.</p></Card>
      ) : null}
      <header className="rounded-lg border border-app-line bg-app-panel/90 p-5 shadow-glow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-app-accent">Entreno completado</p>
            <h1 className="mt-2 text-3xl font-black text-app-text">+{reward.xpGained} XP al banco</h1>
            <p className="mt-2 text-app-muted">{reward.equivalentPhrase}</p>
          </div>
          <Sparkles className="text-app-warn" size={34} />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-app-accent"><Trophy size={20} /><strong>Rango</strong></div>
          <p className="mt-3 text-2xl font-black text-app-text">{reward.rankName}</p>
          <div className="mt-4"><ProgressBar value={reward.rankProgress} label="Progreso de rango" /></div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-app-accent"><Route size={20} /><strong>Ruta simbólica</strong></div>
          <p className="mt-3 text-sm text-app-muted">{reward.equivalentPhrase}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-app-accent"><BadgeCheck size={20} /><strong>Siguiente paso</strong></div>
          <p className="mt-3 text-sm text-app-muted">{reward.nextRecommendation}</p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SessionMeaningCard session={session} routes={routes} />
        <GeoProgressCard session={session} routes={routes} />
        <BreathingInsightCard session={session} routes={routes} />
        <RankedProgressCard session={session} routes={routes} />
        <div className="lg:col-span-2"><CoachInsightCard session={session} routes={routes} /></div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2 text-app-accent"><Medal size={20} /><strong>Récords personales</strong></div>
          {reward.personalRecords.length ? (
            <div className="flex flex-wrap gap-2">{reward.personalRecords.map((record) => <Badge key={record}>{record}</Badge>)}</div>
          ) : <p className="text-sm text-app-muted">Buen entreno. No hubo récord, pero sumaste progreso real.</p>}
        </Card>
        <Card>
          <div className="mb-3 flex items-center gap-2 text-app-accent"><Award size={20} /><strong>Trofeos desbloqueados</strong></div>
          {reward.unlockedTrophies.length ? (
            <div className="grid gap-2">{reward.unlockedTrophies.map((trophy) => <Badge key={trophy.id}>{trophy.title} · +{trophy.xpReward} XP</Badge>)}</div>
          ) : <p className="text-sm text-app-muted">Siguiente trofeo cerca. Una sesión más puede desbloquear algo.</p>}
        </Card>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/dashboard"><Button>Ir al panel</Button></Link>
        <Link to={`/sessions/${session.id}`}><Button variant="secondary">Ver detalle</Button></Link>
        <Link to="/sessions/new"><Button variant="ghost">Registrar otra</Button></Link>
      </div>
    </div>
  );
}
