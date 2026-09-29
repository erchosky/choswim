import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Label, Textarea } from '../../components/ui/Field';
import { ErrorBanner, LoadingState } from '../../components/ui/States';
import { DEFAULT_DISTANCE_ROUTES } from '../../domain/distance-equivalences/baseRoutes';
import { getBestMatchingRoutes } from '../../domain/distance-equivalences/routeEquivalences';
import { toDate } from '../../lib/date';
import { useDistanceRoutes, useInvalidateSessions, useSession } from '../../services/queries';
import { deleteSession, updateSession, updateSessionNotes } from '../../services/sessionService';
import { formatPace } from '../../domain/swimming/metrics';
import { sessionSourceLabels } from '../../shared/constants/labels';
import { logErrorOnce, toVisibleError } from '../../shared/utils/async';
import { useAuthStore } from '../../store/authStore';
import type { SwimSessionFormValues } from '../../lib/validators';
import { BreathingInsightCard } from '../session-meaning/components/BreathingInsightCard';
import { CoachInsightCard } from '../session-meaning/components/CoachInsightCard';
import { GeoProgressCard } from '../session-meaning/components/GeoProgressCard';
import { RankedProgressCard } from '../session-meaning/components/RankedProgressCard';
import { SessionMeaningCard } from '../session-meaning/components/SessionMeaningCard';
import { SessionForm } from './SessionForm';

export function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const sessionQuery = useSession(id);
  const routesQuery = useDistanceRoutes(profile?.uid);
  const invalidateSessions = useInvalidateSessions();
  const [saving, setSaving] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Borrador de notas: null mientras el usuario no ha tocado el campo (se muestra lo guardado).
  const [notesDraft, setNotesDraft] = useState<string | null>(null);

  const session = sessionQuery.data;
  const routes = routesQuery.data?.length ? routesQuery.data : DEFAULT_DISTANCE_ROUTES;

  if (sessionQuery.isPending) return <LoadingState />;
  if (!session || !id) return <Card>Sesión no encontrada.</Card>;
  const routeEquivalent = getBestMatchingRoutes(session.totalDistanceMeters, routes, 1)[0];
  const isAppleHealth = session.source === 'apple_health';

  async function submit(values: SwimSessionFormValues) {
    if (!id || saving) return;
    setSaving(true);
    setError(null);
    try {
      await updateSession(id, values);
      invalidateSessions(id);
    } catch (submitError) {
      logErrorOnce('[sessionDetail] No se pudo actualizar la sesion', submitError);
      setError(toVisibleError(submitError, 'No se pudo actualizar la sesion.'));
    } finally {
      setSaving(false);
    }
  }

  async function removeSession() {
    if (!id || deleting) return;
    if (!window.confirm('¿Eliminar esta sesión? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteSession(id);
      invalidateSessions();
      navigate('/sessions');
    } catch (deleteError) {
      logErrorOnce('[sessionDetail] No se pudo eliminar la sesion', deleteError);
      setError(toVisibleError(deleteError, 'No se pudo eliminar la sesion.'));
      setDeleting(false);
    }
  }

  async function saveAppleHealthNotes() {
    if (!id || savingNotes) return;
    const notes = notesDraft ?? session?.notes ?? '';
    setSavingNotes(true);
    setError(null);
    try {
      await updateSessionNotes(id, notes);
      invalidateSessions(id);
      setNotesDraft(null);
    } catch (notesError) {
      logErrorOnce('[sessionDetail] No se pudieron guardar las notas', notesError);
      setError(toVisibleError(notesError, 'No se pudieron guardar las notas.'));
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-app-accent">Detalle</p>
          <h1 className="mt-1 text-3xl font-black text-app-text">{format(toDate(session.date), 'dd/MM/yyyy')}</h1>
          <p className="text-app-muted">{session.totalDistanceMeters}m · {formatPace(session.pacePer100m)}</p>
        </div>
        <div className="flex gap-2"><Badge>{sessionSourceLabels[session.source ?? 'manual']}</Badge><Badge>+{session.xpGained} XP</Badge><Badge>{session.estimatedCalories} kcal</Badge></div>
      </header>
      <ErrorBanner error={sessionQuery.error} fallback="No se pudo cargar la sesión." />
      <ErrorBanner error={error} />
      <section className="grid gap-4 lg:grid-cols-2">
        <SessionMeaningCard session={session} routes={routes} />
        <GeoProgressCard session={session} routes={routes} />
        <BreathingInsightCard session={session} routes={routes} />
        <RankedProgressCard session={session} routes={routes} />
        <div className="lg:col-span-2"><CoachInsightCard session={session} routes={routes} /></div>
      </section>
      <Card>
        <div className="mb-5 rounded-lg border border-app-line bg-app-bg/50 p-4">
          <h2 className="text-lg font-bold text-app-text">Esta sesión equivale a...</h2>
          <p className="mt-2 text-sm text-app-muted">{routeEquivalent ? routeEquivalent.phrase : 'Crea una ruta manual para activar esta equivalencia.'}</p>
        </div>
        {isAppleHealth ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-app-line bg-app-bg/45 p-4">
              <h2 className="text-lg font-bold text-app-text">Datos importados de Apple Watch</h2>
              <p className="mt-2 text-sm text-app-muted">Los datos crudos están bloqueados para conservar la trazabilidad de HealthKit. Puedes añadir notas personales sin modificar distancia, tiempo o métricas.</p>
              <div className="mt-4 grid gap-3 text-sm text-app-muted sm:grid-cols-2 lg:grid-cols-4">
                <span>UUID: {session.healthKitWorkoutUUID ?? 'Sin UUID'}</span>
                <span>Inicio: {session.startDate ? format(toDate(session.startDate), 'dd/MM/yyyy HH:mm') : 'Sin inicio'}</span>
                <span>Fin: {session.endDate ? format(toDate(session.endDate), 'dd/MM/yyyy HH:mm') : 'Sin fin'}</span>
                <span>FC media: {session.avgHeartRate ? `${Math.round(session.avgHeartRate)} bpm` : 'No disponible'}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="apple-health-notes">Notas personales</Label>
              <Textarea id="apple-health-notes" value={notesDraft ?? session.notes ?? ''} onChange={(event) => setNotesDraft(event.target.value)} />
            </div>
            <Button type="button" onClick={saveAppleHealthNotes} disabled={savingNotes}>{savingNotes ? 'Guardando notas...' : 'Guardar notas'}</Button>
          </div>
        ) : (
          <SessionForm
            defaultValues={{ ...session, date: format(toDate(session.date), 'yyyy-MM-dd') }}
            onSubmit={submit}
            submitLabel={saving ? 'Actualizando...' : 'Actualizar sesión'}
            isSubmitting={saving}
          />
        )}
      </Card>
      <Button
        variant="danger"
        icon={<Trash2 size={18} />}
        onClick={removeSession}
        disabled={deleting}
      >
        {deleting ? 'Eliminando...' : 'Eliminar sesión'}
      </Button>
    </div>
  );
}
