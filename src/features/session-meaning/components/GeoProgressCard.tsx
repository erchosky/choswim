import { MapPinned } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { buildSessionMeaning } from '../sessionMeaning';
import type { DistanceRoute, SwimSession } from '../../../types/models';

export function GeoProgressCard({ session, routes = [] }: { session?: Partial<SwimSession> | null; routes?: DistanceRoute[] }) {
  if (!session) return <Card><p className="text-sm text-app-muted">Sin progreso geográfico todavía.</p></Card>;
  const meaning = buildSessionMeaning({ session, routes });
  return (
    <Card>
      <div className="flex items-center gap-2 text-app-accent"><MapPinned size={20} /><strong>Hoy has llegado hasta...</strong></div>
      <p className="mt-3 text-sm text-app-muted">{meaning.geoProgress.message}</p>
      <p className="mt-2 text-sm text-app-muted">Punto virtual: {meaning.geoProgress.virtualPoint.lat}, {meaning.geoProgress.virtualPoint.lng}</p>
      <div className="mt-4">
        <ProgressBar value={meaning.routeProgress.progressPercent} label={`${meaning.routeProgress.routeName}: faltan ${meaning.routeProgress.remainingMeters.toLocaleString('es-ES')}m`} />
      </div>
      <p className="mt-3 text-sm text-app-muted">Próximo hito: {meaning.geoProgress.milestone.name} · {meaning.geoProgress.milestone.emotionalMessage}</p>
    </Card>
  );
}
