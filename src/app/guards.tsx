import { Navigate, Outlet, useLocation } from 'react-router';
import { LoadingState } from '../components/ui/States';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { isFirebaseConfigured } from '../lib/env';
import { useAuthStore } from '../store/authStore';

export function RequireAuth() {
  const location = useLocation();
  const { user, profile, loading, initialized, error, refreshProfile } = useAuthStore();

  if (!isFirebaseConfigured) {
    return <Navigate to="/login" replace />;
  }

  if (!initialized || loading) return <LoadingState />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (error) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <Card className="max-w-lg" role="alert">
          <h1 className="text-xl font-bold text-app-text">No se pudo cargar tu perfil</h1>
          <p className="mt-2 text-sm text-app-muted">{error}</p>
          <Button className="mt-4" onClick={() => void refreshProfile().catch(() => undefined)}>Reintentar</Button>
        </Card>
      </main>
    );
  }
  if (!profile?.profileCompleted && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { profile } = useAuthStore();
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function RedirectIfAuthed() {
  const { user, profile, loading } = useAuthStore();
  if (loading) return <LoadingState />;
  if (user) return <Navigate to={profile?.profileCompleted ? '/dashboard' : '/onboarding'} replace />;
  return <Outlet />;
}
