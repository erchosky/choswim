import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/States';
import { createSession } from '../../services/sessionService';
import { logErrorOnce, toVisibleError } from '../../shared/utils/async';
import { useAuthStore } from '../../store/authStore';
import type { SwimSessionFormValues } from '../../lib/validators';
import { SessionForm } from './SessionForm';

export function NewSessionPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return <LoadingState />;

  async function submit(values: SwimSessionFormValues) {
    if (!profile || saving) return;
    setSaving(true);
    setError(null);
    try {
      const id = await createSession(profile, values);
      navigate(`/sessions/${id}/reward`, { replace: true });
    } catch (err) {
      logErrorOnce('[sessions/new] save failed', err);
      setError(toVisibleError(err, 'No se pudo guardar el entreno.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase text-app-accent">Entrenamiento</p>
        <h1 className="mt-1 text-3xl font-black text-app-text">Registrar sesión</h1>
        <p className="mt-2 text-sm text-app-muted">Elige preset, ajusta sensaciones y guarda.</p>
      </header>
      {error ? <div className="rounded-lg border border-app-danger/40 bg-app-danger/10 p-4 text-sm text-app-danger">{error}</div> : null}
      <Card><SessionForm onSubmit={submit} submitLabel={saving ? 'Guardando entreno...' : 'Guardar sesión'} isSubmitting={saving} /></Card>
    </div>
  );
}
