import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RANKS, getRankForXP, getRankProgress } from '../../domain/ranks/ranks';
import { useAuthStore } from '../../store/authStore';

export function RankedPage() {
  const { profile } = useAuthStore();
  const current = getRankForXP(profile?.xp ?? 0);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase text-app-accent">Rangos</p>
        <h1 className="mt-1 text-3xl font-black text-app-text">Sistema de rangos</h1>
      </header>
      <Card>
        <div className={`rounded-lg bg-gradient-to-br ${current.token} p-5 text-app-bg`}>
          <p className="text-sm font-black uppercase">Tu liga</p>
          <h2 className="mt-1 text-4xl font-black">{current.name}</h2>
          <p className="mt-2 font-semibold">{current.description}</p>
        </div>
        <div className="mt-5"><ProgressBar value={getRankProgress(profile?.xp ?? 0)} label={`${profile?.xp ?? 0} XP`} /></div>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {RANKS.map((rank) => (
          <Card key={rank.name} className={rank.name === current.name ? 'border-aqua' : ''}>
            <Badge>{rank.minXP.toLocaleString('es-ES')} XP</Badge>
            <h2 className="mt-3 text-xl font-black text-app-text">{rank.name}</h2>
            <p className="mt-2 text-sm text-app-muted">{rank.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
