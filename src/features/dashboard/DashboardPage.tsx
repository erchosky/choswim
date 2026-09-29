import { Suspense, lazy, useMemo } from 'react';
import { Link } from 'react-router';
import { Clock, Crown, Flame, Medal, Plus, Shield, Target, Trophy, Waves, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatCard } from '../../components/ui/StatCard';
import { ErrorBanner, LoadingState } from '../../components/ui/States';
import { describeDistance } from '../../domain/distance/equivalences';
import { DEFAULT_DISTANCE_ROUTES } from '../../domain/distance-equivalences/baseRoutes';
import { getBestMatchingRoutes, getWeeklyRouteSummary } from '../../domain/distance-equivalences/routeEquivalences';
import { evaluateTrophies } from '../../domain/gamification/achievements';
import { getBossProgress, getWeeklyBoss } from '../../domain/gamification/bosses';
import { generateDailyMission } from '../../domain/gamification/dailyMissions';
import { getAccountLevel } from '../../domain/gamification/levels';
import { recommendNextWorkout } from '../../domain/gamification/recommendations';
import { calculateTrainingStreak } from '../../domain/gamification/streaks';
import { getNextRank, getRankForXP, getRankProgress } from '../../domain/ranks/ranks';
import { aggregateStats } from '../../domain/stats/userStats';
import { formatPace } from '../../domain/swimming/metrics';
import { useDistanceRoutes, useUserSessions } from '../../services/queries';
import { useAuthStore } from '../../store/authStore';
import { SessionMeaningCard } from '../session-meaning/components/SessionMeaningCard';

const DashboardChart = lazy(() => import('./DashboardChart').then((module) => ({ default: module.DashboardChart })));

export function DashboardPage() {
  const { profile } = useAuthStore();
  const sessionsQuery = useUserSessions(profile?.uid);
  const routesQuery = useDistanceRoutes(profile?.uid);
  const sessions = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data]);
  const routes = useMemo(() => routesQuery.data?.length ? routesQuery.data : DEFAULT_DISTANCE_ROUTES, [routesQuery.data]);
  const viewModel = useMemo(() => {
    if (!profile) return null;
    const stats = aggregateStats(sessions);
    const rank = getRankForXP(profile.xp ?? 0);
    const nextRank = getNextRank(profile.xp ?? 0);
    const rankProgress = getRankProgress(profile.xp ?? 0);
    const todayEquivalent = getBestMatchingRoutes(stats.metersToday, routes, 1)[0];
    const weeklyEquivalent = getWeeklyRouteSummary(stats.metersWeek, routes);
    const accountLevel = getAccountLevel(profile.xp ?? 0);
    const boss = getWeeklyBoss(profile.weeklyTargetMeters);
    const bossProgress = getBossProgress(stats.metersWeek, boss);
    const importedSessions = sessions.filter((session) => session.source === 'apple_health').length;
    const streak = calculateTrainingStreak(sessions);
    const favoriteRoute = routes.find((route) => route.isFavorite);
    const mission = generateDailyMission({
      mainGoal: profile.mainGoal,
      level: profile.level,
      sessionsWeek: stats.sessionsWeek,
      weeklyMeters: stats.metersWeek,
      weeklyTargetMeters: profile.weeklyTargetMeters,
      lastSession: stats.lastSession,
      favoriteRoute
    });
    const trophies = evaluateTrophies({ sessions, weeklyMeters: stats.metersWeek, streakDays: streak.streakDays || profile.streakDays || 0, routes, bossTargetMeters: boss.targetMeters });
    return {
      stats,
      rank,
      nextRank,
      rankProgress,
      todayEquivalent,
      weeklyEquivalent,
      accountLevel,
      boss,
      bossProgress,
      importedSessions,
      streak,
      mission,
      trophies,
      unlockedTrophies: trophies.filter((trophy) => trophy.unlocked),
      nextTrophy: trophies.find((trophy) => !trophy.unlocked),
      recommendation: recommendNextWorkout({
        mainGoal: profile.mainGoal,
        level: profile.level,
        weeklyMeters: stats.metersWeek,
        weeklyTargetMeters: profile.weeklyTargetMeters,
        sessionsWeek: stats.sessionsWeek
      })
    };
  }, [profile, routes, sessions]);

  if (!profile || sessionsQuery.isPending || !viewModel) return <LoadingState />;

  const { stats, rank, nextRank, rankProgress, todayEquivalent, weeklyEquivalent, accountLevel, boss, bossProgress, importedSessions, streak, mission, unlockedTrophies, nextTrophy, recommendation } = viewModel;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-app-accent">Panel</p>
          <h1 className="mt-1 text-3xl font-black text-app-text">Hola, {profile.displayName}</h1>
          <p className="text-app-muted">{describeDistance(stats.metersWeek)}</p>
        </div>
        <Link to="/sessions/new">
          <Button className="sm:w-auto" icon={<Plus size={18} />}>Registrar entreno</Button>
        </Link>
      </header>

      <ErrorBanner error={sessionsQuery.error} fallback="No se pudieron cargar las sesiones." />
      <ErrorBanner error={routesQuery.error} fallback="No se pudieron cargar las rutas de distancia." />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Metros hoy" value={`${stats.metersToday}m`} icon={<Waves size={20} />} />
        <StatCard label="Semana" value={`${stats.metersWeek}m`} hint={`${stats.sessionsWeek} sesiones`} icon={<Target size={20} />} />
        <StatCard label="Nivel de cuenta" value={`Nivel ${accountLevel.level}`} hint={`${accountLevel.progressPercent}% al siguiente`} icon={<Zap size={20} />} />
        <StatCard label="Apple Watch" value={`${importedSessions}`} hint="sesiones importadas recientes" icon={<Medal size={20} />} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
        <Card className="lg:col-span-3">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-app-accent">Ritual diario</p>
              <h2 className="mt-1 text-2xl font-black text-app-text">{mission.title}</h2>
              <p className="mt-2 text-sm text-app-muted">{mission.description}</p>
              <div className="mt-3 flex flex-wrap gap-2"><Badge>{mission.targetMeters}m</Badge><Badge>+{mission.rewardXP} XP</Badge><Badge>{mission.focus}</Badge></div>
            </div>
            <div className="rounded-lg border border-app-line bg-app-bg/45 p-3">
              <p className="text-xs font-semibold uppercase text-app-muted">Racha</p>
              <p className="mt-2 text-2xl font-black text-app-text">{streak.streakDays || profile.streakDays || 0} días</p>
              <p className="mt-1 text-xs text-app-muted">{streak.message}</p>
            </div>
            <div className="rounded-lg border border-app-line bg-app-bg/45 p-3">
              <p className="text-xs font-semibold uppercase text-app-muted">Duelo contra colega</p>
              <p className="mt-2 text-2xl font-black text-app-text">{stats.metersWeek >= profile.weeklyTargetMeters ? 'Vas arriba' : 'Puedes remontar'}</p>
              <p className="mt-1 text-xs text-app-muted">Comparativa privada preparada para snapshot real.</p>
            </div>
            <div className="rounded-lg border border-app-line bg-app-bg/45 p-3">
              <p className="text-xs font-semibold uppercase text-app-muted">Siguiente desbloqueo</p>
              <p className="mt-2 text-lg font-black text-app-text">{nextTrophy?.title ?? 'Temporada limpia'}</p>
              <p className="mt-1 text-xs text-app-muted">{nextTrophy ? `${nextTrophy.progressPercent}% completado` : 'Sin trofeos pendientes.'}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-app-text">Meta semanal</h2>
              <p className="mt-1 text-sm text-app-muted">{stats.metersWeek.toLocaleString('es-ES')}m de {profile.weeklyTargetMeters.toLocaleString('es-ES')}m</p>
            </div>
            <Badge>{Math.min(100, Math.round((stats.metersWeek / profile.weeklyTargetMeters) * 100))}%</Badge>
          </div>
          <div className="mt-4"><ProgressBar value={(stats.metersWeek / profile.weeklyTargetMeters) * 100} label="Progreso semanal" /></div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-app-text">Boss semanal: {boss.name}</h2>
              <p className="mt-1 text-sm text-app-muted">{boss.description}</p>
            </div>
            <Crown className="text-app-warn" size={24} />
          </div>
          <div className="mt-4"><ProgressBar value={bossProgress.progressPercent} label={bossProgress.defeated ? 'Boss derrotado' : `Faltan ${bossProgress.remainingMeters}m`} /></div>
          <Badge className="mt-3">+{boss.rewardXP} XP</Badge>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-app-text">Trofeos</h2>
              <p className="mt-1 text-sm text-app-muted">{unlockedTrophies.length} desbloqueados · {nextTrophy ? `Siguiente: ${nextTrophy.title}` : 'Todos completados'}</p>
            </div>
            <Trophy className="text-app-warn" size={24} />
          </div>
          {nextTrophy ? <div className="mt-4"><ProgressBar value={nextTrophy.progressPercent} label={`${nextTrophy.progress}/${nextTrophy.target}`} /></div> : null}
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-app-text">Equivalencia de hoy</h2>
              <p className="mt-2 text-sm text-app-muted">{todayEquivalent ? todayEquivalent.phrase : 'Crea una ruta para comparar tus metros de hoy.'}</p>
            </div>
            <Badge>{stats.metersToday}m</Badge>
          </div>
          <Link className="mt-4 inline-block text-sm font-semibold text-app-accent" to="/distance-routes">Gestionar rutas</Link>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-app-text">Equivalencia semanal</h2>
              <p className="mt-2 text-sm text-app-muted">{weeklyEquivalent ? weeklyEquivalent.phrase : 'Tu semana aún no tiene una ruta comparable.'}</p>
            </div>
            <Badge>{stats.metersWeek}m</Badge>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-app-text">Progreso reciente</h2>
              <p className="text-sm text-app-muted">Metros y XP de las últimas sesiones.</p>
            </div>
          </div>
          <div className="h-72">
            <Suspense fallback={<div className="grid h-full place-items-center text-sm text-app-muted">Cargando gráfica...</div>}>
              <DashboardChart data={stats.chartData} />
            </Suspense>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className={`rounded-lg bg-gradient-to-br ${rank.token} p-4 text-app-bg`}>
              <p className="text-xs font-black uppercase">Rango actual</p>
              <h2 className="mt-1 text-3xl font-black">{rank.name}</h2>
              <p className="mt-2 text-sm font-semibold">{rank.description}</p>
            </div>
            <div className="mt-4">
              <ProgressBar value={rankProgress} label={nextRank ? `Siguiente: ${nextRank.name}` : 'Rango máximo'} />
            </div>
          </Card>
          <StatCard label="Tiempo total" value={`${Math.round(profile.totalActiveMinutes ?? stats.totalMinutes)} min`} icon={<Clock size={20} />} />
          <StatCard label="Racha" value={`${profile.streakDays ?? 0} días`} icon={<Flame size={20} />} />
          <StatCard label="Duelo privado" value={stats.metersWeek >= profile.weeklyTargetMeters ? 'Vas líder' : 'Apretar'} hint="Comparativa base contra tu meta/colega" icon={<Shield size={20} />} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="text-lg font-bold text-app-text">Último entrenamiento</h2>
          {stats.lastSession ? (
            <div className="mt-3 space-y-2 text-sm text-app-muted">
              <p>{stats.lastSession.totalDistanceMeters}m · {formatPace(stats.lastSession.pacePer100m)} · +{stats.lastSession.xpGained} XP</p>
              <p>{stats.lastSession.notes || 'Sin notas. Buen material para que el entrenador IA detecte patrón cuando haya más sesiones.'}</p>
            </div>
          ) : <p className="mt-3 text-sm text-app-muted">Registra tu primera sesión para activar estadísticas.</p>}
        </Card>
        {stats.lastSession ? <SessionMeaningCard session={stats.lastSession} routes={routes} /> : null}
        <Card>
          <h2 className="text-lg font-bold text-app-text">Reto activo</h2>
          <p className="mt-3 text-sm text-app-muted">Nada {Math.max(1000, Math.round(profile.weeklyTargetMeters * 0.25))}m esta semana y bloquea una racha de {Math.max(2, stats.sessionsWeek + 1)} sesiones.</p>
          <Link className="mt-4 inline-block text-sm font-semibold text-app-accent" to="/challenges">Ver retos</Link>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-app-text">Próximo entrenamiento</h2>
          <p className="mt-3 text-sm text-app-muted">{recommendation}</p>
          <Link className="mt-4 inline-block text-sm font-semibold text-app-accent" to="/workouts">Abrir biblioteca</Link>
        </Card>
      </section>
    </div>
  );
}
