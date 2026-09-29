import { useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ErrorBanner, LoadingState } from '../../components/ui/States';
import { aggregateStats } from '../../domain/stats/userStats';
import { formatPace } from '../../domain/swimming/metrics';
import { useLatestLeaderboard, useUserSessions } from '../../services/queries';
import { useAuthStore } from '../../store/authStore';
import type { LeaderboardEntry } from '../../types/models';

export function LeaderboardPage() {
  const { profile } = useAuthStore();
  const leaderboardQuery = useLatestLeaderboard();
  const sessionsQuery = useUserSessions(profile?.uid);
  const snapshotRows = leaderboardQuery.data;
  const ownSessions = sessionsQuery.data;

  const rows = useMemo<LeaderboardEntry[]>(() => {
    if (!profile) return [];
    const ownStats = aggregateStats(ownSessions ?? []);
    const ownRow: LeaderboardEntry = {
      userId: profile.uid,
      displayName: profile.displayName,
      weeklyMeters: ownStats.metersWeek,
      weeklyXP: ownStats.xpWeek,
      sessions: ownStats.sessionsWeek,
      streak: profile.streakDays ?? 0,
      bestPace: ownStats.bestPace,
      challengesCompleted: 0,
      improvement: Math.min(100, Math.round((ownStats.sessionsWeek / 3) * 100))
    };
    const base = [...(snapshotRows ?? []).filter((row) => row.userId !== profile.uid), ownRow];
    return base.sort((a, b) => b.weeklyXP - a.weeklyXP || b.weeklyMeters - a.weeklyMeters);
  }, [snapshotRows, ownSessions, profile]);

  if (leaderboardQuery.isPending || sessionsQuery.isPending) return <LoadingState />;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase text-app-accent">Ranking privado</p>
        <h1 className="mt-1 text-3xl font-black text-app-text">Clasificación</h1>
        <p className="mt-2 text-sm text-app-muted">Puntuación ponderada: XP semanal, metros, sesiones, racha, constancia y mejora. Preparado para semanal, mensual e histórico.</p>
      </header>
      <ErrorBanner error={leaderboardQuery.error} fallback="No se pudo cargar el snapshot del ranking." />
      <ErrorBanner error={sessionsQuery.error} fallback="No se pudieron cargar tus sesiones." />
      <div className="grid gap-3">
        {rows.map((row, index) => (
          <Card key={row.userId} className={row.userId === profile?.uid ? 'border-app-accent' : ''}>
            <div className="grid gap-3 md:grid-cols-[60px_1fr_repeat(5,120px)] md:items-center">
              <Badge>#{index + 1}</Badge>
              <strong className="text-app-text">{row.displayName}</strong>
              <span>{row.weeklyMeters}m</span>
              <span>{row.weeklyXP} XP</span>
              <span>{row.sessions} sesiones</span>
              <span>{row.streak} racha</span>
              <span>{formatPace(row.bestPace)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
