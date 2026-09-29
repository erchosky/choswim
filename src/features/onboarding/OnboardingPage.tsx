import { useNavigate } from 'react-router';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { completeUserProfile } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import type { ProfileFormValues } from '../../lib/validators';
import { toVisibleError } from '../../shared/utils/async';
import { ProfileForm } from './ProfileForm';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, error: authError } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  async function submit(values: ProfileFormValues) {
    setError(null);
    if (!user?.email) {
      const message = 'No hay una sesión válida. Vuelve a iniciar sesión.';
      console.error('[onboarding] missing authenticated user');
      setError(message);
      return;
    }

    try {
      await completeUserProfile(user.uid, user.email, values);
      await refreshProfile();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = toVisibleError(err, 'No se pudo guardar el perfil.');
      console.error('[onboarding] profile save failed', err);
      setError(message);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-app-accent">Configuración inicial</p>
        <h1 className="mt-2 text-3xl font-black text-app-text">Configura tu perfil de agua</h1>
      </div>
      {authError ? (
        <div className="mb-4 rounded-lg border border-gold/40 bg-gold/10 p-4 text-sm text-amber-100">
          {authError}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg border border-coral/40 bg-coral/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      <Card>
        <ProfileForm defaultValues={{ displayName: profile?.displayName ?? user?.displayName ?? '' }} onSubmit={submit} submitLabel="Entrar a ChooseSwim" />
      </Card>
    </main>
  );
}
