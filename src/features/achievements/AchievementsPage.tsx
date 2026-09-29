import { Award, Crown, Medal, Trophy } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ErrorBanner, LoadingState } from '../../components/ui/States';
import { evaluateTrophies, type TrophyProgress } from '../../domain/gamification/achievements';
import { getBossProgress, WEEKLY_BOSSES } from '../../domain/gamification/bosses';
import { aggregateStats } from '../../domain/stats/userStats';
import { useUserSessions } from '../../services/queries';
import { useAuthStore } from '../../store/authStore';

export function AchievementsPage() {
  const { profile } = useAuthStore();
  const sessionsQuery = useUserSessions(profile?.uid);
  const sessions = sessionsQuery.data ?? [];

  if (!profile || sessionsQuery.isPending) return <LoadingState />;

  const stats = aggregateStats(sessions);
  const trophies = evaluateTrophies({ sessions, weeklyMeters: stats.metersWeek, streakDays: profile.streakDays ?? 0 });

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase text-app-accent">Gamificación</p>
        <h1 className="mt-1 text-3xl font-black text-app-text">Trofeos, medallas y bosses</h1>
        <p className="mt-2 text-sm text-app-muted">Tu progreso visible: qué desbloqueaste, qué te falta y qué boss puedes derrotar esta semana.</p>
      </header>
      <ErrorBanner error={sessionsQuery.error} fallback="No se pudieron cargar los trofeos." />

      <section className="grid gap-4 md:grid-cols-3">
        <Card><Badge>Trofeos</Badge><p className="mt-3 text-3xl font-black text-app-text">{trophies.filter((trophy) => trophy.unlocked).length}/{trophies.length}</p></Card>
        <Card><Badge>Medallas</Badge><p className="mt-3 text-3xl font-black text-app-text">Temporada activa</p><p className="mt-1 text-sm text-app-muted">Top semanal, mensual, mejora y constancia preparados para snapshots.</p></Card>
        <Card><Badge>Racha</Badge><p className="mt-3 text-3xl font-black text-app-text">{profile.streakDays ?? 0} días</p><p className="mt-1 text-sm text-app-muted">Bonus XP activo al registrar sesiones consecutivas.</p></Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {WEEKLY_BOSSES.map((boss) => {
          const progress = getBossProgress(stats.metersWeek, boss);
          return (
            <Card key={boss.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-app-text">{boss.name}</h2>
                  <p className="mt-1 text-sm text-app-muted">{boss.description}</p>
                </div>
                <Crown className="text-app-warn" />
              </div>
              <div className="mt-4"><ProgressBar value={progress.progressPercent} label={`${stats.metersWeek}/${boss.targetMeters}m`} /></div>
              <div className="mt-3 flex gap-2"><Badge>{boss.difficulty}</Badge><Badge>+{boss.rewardXP} XP</Badge></div>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {trophies.map((trophy) => <TrophyCard key={trophy.id} trophy={trophy} />)}
      </section>
    </div>
  );
}

function TrophyCard({ trophy }: { trophy: TrophyProgress }) {
  return (
    <Card className={trophy.unlocked ? 'unlock-pulse border-app-accent' : ''}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-app-text">{trophy.title}</h2>
          <p className="mt-1 text-sm text-app-muted">{trophy.description}</p>
        </div>
        {trophy.unlocked ? <Trophy className="text-app-warn" /> : trophy.rarity === 'legendario' ? <Crown className="text-app-warn" /> : trophy.rarity === 'épico' ? <Medal className="text-app-accent" /> : <Award className="text-app-muted" />}
      </div>
      <div className="mt-4"><ProgressBar value={trophy.progressPercent} label={`${trophy.progress}/${trophy.target}`} /></div>
      <div className="mt-3 flex gap-2"><Badge>{trophy.rarity}</Badge><Badge>+{trophy.xpReward} XP</Badge>{trophy.unlocked ? <Badge>Desbloqueado</Badge> : null}</div>
    </Card>
  );
}
