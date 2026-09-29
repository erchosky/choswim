import { Shield } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { buildSessionMeaning } from '../sessionMeaning';
import type { DistanceRoute, SwimSession } from '../../../types/models';

export function RankedProgressCard({ session, routes = [] }: { session?: Partial<SwimSession> | null; routes?: DistanceRoute[] }) {
  if (!session) return <Card><p className="text-sm text-app-muted">Sin desglose ranked todavía.</p></Card>;
  const meaning = buildSessionMeaning({ session, routes });
  const breathing = meaning.ranked.find((item) => item.category === 'breathing') ?? meaning.ranked[0];
  return (
    <Card>
      <div className="flex items-center gap-2 text-app-accent"><Shield size={20} /><strong>Rango {breathing.label}</strong></div>
      <p className="mt-3 text-2xl font-black text-app-text">{breathing.rank}</p>
      <div className="mt-4"><ProgressBar value={breathing.progressToNext} label="Progreso al siguiente subrango" /></div>
      <p className="mt-3 text-sm text-app-muted">{breathing.reason}</p>
    </Card>
  );
}
