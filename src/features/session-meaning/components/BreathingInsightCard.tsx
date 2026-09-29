import { Wind } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { buildSessionMeaning } from '../sessionMeaning';
import type { DistanceRoute, SwimSession } from '../../../types/models';

export function BreathingInsightCard({ session, routes = [] }: { session?: Partial<SwimSession> | null; routes?: DistanceRoute[] }) {
  if (!session) return <Card><p className="text-sm text-app-muted">Sin lectura respiratoria todavía.</p></Card>;
  const meaning = buildSessionMeaning({ session, routes });
  return (
    <Card>
      <div className="flex items-center gap-2 text-app-accent"><Wind size={20} /><strong>Cuello de botella</strong></div>
      <p className="mt-3 text-sm text-app-muted">{meaning.narrative.nextAction}</p>
      <div className="mt-4"><ProgressBar value={meaning.analysis.score.breathing} label="Control respiratorio" /></div>
    </Card>
  );
}
