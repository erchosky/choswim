import { type FormEvent, useState } from 'react';
import { MapPin, Plus, Save, Star, Trash2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, Label, Select } from '../../components/ui/Field';
import { EmptyState, ErrorBanner, LoadingState } from '../../components/ui/States';
import { DEFAULT_DISTANCE_ROUTES } from '../../domain/distance-equivalences/baseRoutes';
import { formatRouteEquivalent } from '../../domain/distance-equivalences/routeEquivalences';
import { createDistanceRoute, deleteDistanceRoute, updateDistanceRoute, type DistanceRouteFormValues } from '../../services/distanceRouteService';
import { useDistanceRoutes, useInvalidateRoutes } from '../../services/queries';
import { logErrorOnce, toVisibleError } from '../../shared/utils/async';
import { useAuthStore } from '../../store/authStore';
import type { DistanceRoute, DistanceRouteCategory } from '../../types/models';

const categoryLabels: Record<DistanceRouteCategory, string> = {
  personal: 'Personal',
  city: 'Ciudad',
  challenge: 'Reto',
  funny: 'Divertida'
};

const initialForm: DistanceRouteFormValues = {
  name: 'Casa -> Piscina',
  fromLabel: 'Casa',
  toLabel: 'Piscina',
  distanceMeters: 1000,
  category: 'personal',
  isFavorite: true
};

export function DistanceRoutesPage() {
  const { profile } = useAuthStore();
  const routesQuery = useDistanceRoutes(profile?.uid);
  const invalidateRoutes = useInvalidateRoutes();
  const [form, setForm] = useState<DistanceRouteFormValues>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleRoutes = routesQuery.data?.length ? routesQuery.data : DEFAULT_DISTANCE_ROUTES;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!profile || saving) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateDistanceRoute(editingId, form);
      } else {
        await createDistanceRoute(profile.uid, form);
      }
      setEditingId(null);
      setForm(initialForm);
      await invalidateRoutes(profile.uid);
    } catch (err) {
      logErrorOnce('[distanceRoutes] save failed', err);
      setError(toVisibleError(err, 'No se pudo guardar la ruta.'));
    } finally {
      setSaving(false);
    }
  }

  async function removeRoute(routeId: string) {
    if (!profile || deletingId) return;
    if (!window.confirm('¿Eliminar esta ruta personal? Esta acción no se puede deshacer.')) return;
    setDeletingId(routeId);
    setError(null);
    try {
      await deleteDistanceRoute(routeId);
      await invalidateRoutes(profile.uid);
    } catch (err) {
      logErrorOnce('[distanceRoutes] delete failed', err);
      setError(toVisibleError(err, 'No se pudo eliminar la ruta.'));
    } finally {
      setDeletingId(null);
    }
  }

  function editRoute(route: DistanceRoute) {
    setEditingId(route.id);
    setForm({
      name: route.name,
      fromLabel: route.fromLabel,
      toLabel: route.toLabel,
      distanceMeters: route.distanceMeters,
      category: route.category,
      isFavorite: route.isFavorite
    });
  }

  if (routesQuery.isPending) return <LoadingState />;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase text-app-accent">Equivalencias</p>
        <h1 className="mt-1 text-3xl font-black text-app-text">Rutas de distancia</h1>
        <p className="mt-2 max-w-2xl text-sm text-app-muted">Crea rutas manuales para convertir metros nadados en frases comparativas. No usa Google Maps ni Mapbox todavía.</p>
      </header>

      <ErrorBanner error={routesQuery.error} fallback="No se pudieron cargar las rutas." />
      <ErrorBanner error={error} />

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="mb-4 flex items-center gap-2 text-app-accent">
            <Plus size={20} />
            <h2 className="font-bold text-app-text">{editingId ? 'Editar ruta' : 'Crear nueva ruta'}</h2>
          </div>
          <form className="grid gap-4" onSubmit={submit}>
            <div><Label htmlFor="route-name">Nombre</Label><Input id="route-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="route-from">Desde</Label><Input id="route-from" value={form.fromLabel} onChange={(event) => setForm({ ...form, fromLabel: event.target.value })} required /></div>
              <div><Label htmlFor="route-to">Hasta</Label><Input id="route-to" value={form.toLabel} onChange={(event) => setForm({ ...form, toLabel: event.target.value })} required /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="route-distance">Distancia metros</Label><Input id="route-distance" type="number" min={1} value={form.distanceMeters} onChange={(event) => setForm({ ...form, distanceMeters: Number(event.target.value) })} required /></div>
              <div>
                <Label htmlFor="route-category">Categoría</Label>
                <Select id="route-category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as DistanceRouteCategory })}>
                  {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select>
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-lg border border-app-line bg-app-bg/55 px-3 py-3 text-sm font-semibold text-app-muted">
              <input type="checkbox" className="h-5 w-5 accent-cyan-300" checked={form.isFavorite} onChange={(event) => setForm({ ...form, isFavorite: event.target.checked })} />
              Ruta favorita
            </label>
            <Button type="submit" disabled={saving} icon={<Save size={18} />}>{saving ? 'Guardando ruta...' : editingId ? 'Actualizar ruta' : 'Crear ruta'}</Button>
          </form>
        </Card>

        <div className="grid gap-4">
          <Card>
            <div className="flex items-center gap-2 text-app-accent">
              <Star size={20} />
              <h2 className="font-bold text-app-text">Ruta favorita</h2>
            </div>
            <p className="mt-3 text-sm text-app-muted">{formatRouteEquivalent(1000, visibleRoutes.find((route) => route.isFavorite) ?? visibleRoutes[0]).phrase}</p>
          </Card>

          {!visibleRoutes.length ? <EmptyState title="Sin rutas" description="Crea tu primera ruta manual para activar equivalencias." /> : visibleRoutes.map((route) => (
            <Card key={route.id} className={route.isFavorite ? 'border-aqua' : ''}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-app-text">{route.name}</h2>
                    {route.isFavorite ? <Badge>Favorita</Badge> : null}
                    <Badge>{categoryLabels[route.category]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-app-muted">{route.fromLabel} {'->'} {route.toLabel} · {route.distanceMeters.toLocaleString('es-ES')}m</p>
                </div>
                {route.userId !== 'global' ? (
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => editRoute(route)} icon={<MapPin size={16} />}>Editar</Button>
                    <Button variant="danger" onClick={() => void removeRoute(route.id)} disabled={deletingId === route.id} icon={<Trash2 size={16} />}>{deletingId === route.id ? 'Eliminando...' : 'Eliminar'}</Button>
                  </div>
                ) : <Badge>Ejemplo</Badge>}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
