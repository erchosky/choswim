import { MessageSquareText } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { buildSessionMeaning } from '../sessionMeaning';
import type { DistanceRoute, SwimSession } from '../../../types/models';

export function CoachInsightCard({ session, routes = [] }: { session?: Partial<SwimSession> | null; routes?: DistanceRoute[] }) {
  if (!session) return <Card><p className="text-sm text-app-muted">El coach necesita al menos una sesión.</p></Card>;
  const meaning = buildSessionMeaning({ session, routes });
  return (
    <Card>
      <div className="flex items-center gap-2 text-app-accent"><MessageSquareText size={20} /><strong>Mensaje útil</strong></div>
      <p className="mt-3 text-sm leading-6 text-app-muted">{meaning.narrative.technicalInsight}</p>
      <p className="mt-3 rounded-lg border border-app-line bg-app-bg/45 p-3 text-sm text-app-text">{meaning.narrative.coachMessage}</p>
    </Card>
  );
}
