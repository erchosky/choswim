import { Brain } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { buildSessionMeaning } from '../sessionMeaning';
import type { DistanceRoute, SwimSession } from '../../../types/models';

export function SessionMeaningCard({ session, routes = [] }: { session?: Partial<SwimSession> | null; routes?: DistanceRoute[] }) {
  if (!session) {
    return <Card><p className="text-sm text-app-muted">Aún no hay datos suficientes para construir narrativa de sesión.</p></Card>;
  }
  const meaning = buildSessionMeaning({ session, routes });
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-app-accent/12 p-2 text-app-accent"><Brain size={20} /></div>
        <div>
          <p className="text-xs font-semibold uppercase text-app-accent">Lectura del entreno</p>
          <h2 className="mt-1 text-xl font-black text-app-text">{meaning.narrative.headline}</h2>
          <p className="mt-2 text-sm leading-6 text-app-muted">{meaning.narrative.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Limitador: {limiterLabel(meaning.analysis.mainLimiter)}</Badge>
            <Badge>Fatiga: {fatigueLabel(meaning.analysis.fatigueType)}</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

function limiterLabel(value: string) {
  const labels: Record<string, string> = {
    breathing: 'Respiración',
    pace: 'Ritmo',
    technique: 'Técnica',
    fatigue: 'Fatiga',
    environment: 'Entorno',
    unknown: 'Sin datos'
  };
  return labels[value] ?? value;
}

function fatigueLabel(value: string) {
  const labels: Record<string, string> = {
    respiratory: 'Respiratoria',
    cardio: 'Cardio',
    muscular: 'Muscular',
    mixed: 'Mixta',
    unknown: 'Sin clasificar'
  };
  return labels[value] ?? value;
}
