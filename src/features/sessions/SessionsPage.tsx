import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { startOfDay } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input, Label, Select } from '../../components/ui/Field';
import { EmptyState, ErrorBanner, LoadingState } from '../../components/ui/States';
import { formatPace } from '../../domain/swimming/metrics';
import { toDate } from '../../lib/date';
import { sessionGoals, styles } from '../../lib/validators';
import { useSessionHistory } from '../../services/queries';
import { sessionGoalLabels, sessionSourceLabels, swimStyleLabels } from '../../shared/constants/labels';
import { useAuthStore } from '../../store/authStore';

export function SessionsPage() {
  const { profile } = useAuthStore();
  const history = useSessionHistory(profile?.uid);
  const [goal, setGoal] = useState('');
  const [style, setStyle] = useState('');
  const [source, setSource] = useState('');
  const [from, setFrom] = useState('');

  const sessions = useMemo(() => history.data?.pages.flat() ?? [], [history.data]);
  const isFiltering = Boolean(goal || style || source || from);

  const filtered = useMemo(() => {
    // `from` viene de <input type="date"> (AAAA-MM-DD): se compara desde el inicio de ese día en hora local.
    const fromTime = from ? startOfDay(new Date(`${from}T00:00`)).getTime() : undefined;
    return sessions.filter((session) => {
      const sessionSource = session.source ?? 'manual';
      return (!goal || session.goal === goal)
        && (!style || session.style === style)
        && (!source || sessionSource === source)
        && (fromTime === undefined || toDate(session.date).getTime() >= fromTime);
    });
  }, [sessions, goal, style, source, from]);

  if (history.isPending) return <LoadingState />;

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-app-accent">Historial</p>
          <h1 className="mt-1 text-3xl font-black text-app-text">Entrenos</h1>
        </div>
        <Link to="/sessions/new"><Button icon={<Plus size={18} />}>Nuevo</Button></Link>
      </header>
      <Card className="grid gap-3 md:grid-cols-4">
        <div><Label htmlFor="filter-from">Desde</Label><Input id="filter-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></div>
        <div>
          <Label htmlFor="filter-goal">Objetivo</Label>
          <Select id="filter-goal" value={goal} onChange={(event) => setGoal(event.target.value)}>
            <option value="">Todos</option>
            {sessionGoals.map((value) => <option key={value} value={value}>{sessionGoalLabels[value]}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="filter-style">Estilo</Label>
          <Select id="filter-style" value={style} onChange={(event) => setStyle(event.target.value)}>
            <option value="">Todos</option>
            {styles.map((value) => <option key={value} value={value}>{swimStyleLabels[value]}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="filter-source">Origen</Label>
          <Select id="filter-source" value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="">Todos</option>
            <option value="manual">{sessionSourceLabels.manual}</option>
            <option value="apple_health">{sessionSourceLabels.apple_health}</option>
          </Select>
        </div>
      </Card>
      <ErrorBanner error={history.error} fallback="No se pudo cargar el historial." />
      {!filtered.length ? (
        <EmptyState
          title="Sin sesiones"
          description={isFiltering ? 'Ninguna sesión cargada coincide con los filtros.' : 'Registra un entrenamiento para activar histórico, XP y progreso.'}
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((session) => (
            <Link key={session.id} to={`/sessions/${session.id}`}>
              <Card className="transition hover:border-aqua">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-app-text">{session.totalDistanceMeters}m · {formatPace(session.pacePer100m)}</p>
                    <p className="text-sm text-app-muted">{swimStyleLabels[session.style]} · {sessionGoalLabels[session.goal]} · intensidad {session.intensity}</p>
                  </div>
                  <div className="flex gap-2"><Badge>{sessionSourceLabels[session.source ?? 'manual']}</Badge><Badge>+{session.xpGained ?? 0} XP</Badge><Badge>{session.sessionScore ?? 0}/100</Badge></div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {history.hasNextPage ? (
        <Button type="button" variant="secondary" onClick={() => void history.fetchNextPage()} disabled={history.isFetchingNextPage}>
          {history.isFetchingNextPage ? 'Cargando más...' : 'Cargar más sesiones'}
        </Button>
      ) : null}
    </div>
  );
}
