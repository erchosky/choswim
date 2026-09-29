import { Card } from '../../components/ui/Card';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import { useAuthStore } from '../../store/authStore';
import { updateUserProfile } from '../../services/userService';
import type { ProfileFormValues } from '../../lib/validators';
import { ProfileForm } from '../onboarding/ProfileForm';

export function ProfilePage() {
  const { profile, refreshProfile } = useAuthStore();
  if (!profile) return null;

  async function submit(values: ProfileFormValues) {
    if (!profile) return;
    await updateUserProfile(profile.uid, values);
    await refreshProfile();
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase text-app-accent">Perfil</p>
        <h1 className="mt-1 text-3xl font-black text-app-text">Datos de nadador</h1>
      </header>
      <Card>
        <h2 className="mb-3 text-lg font-bold text-app-text">Tema de la app</h2>
        <ThemeToggle />
      </Card>
      <Card><ProfileForm defaultValues={profile} onSubmit={submit} /></Card>
    </div>
  );
}
