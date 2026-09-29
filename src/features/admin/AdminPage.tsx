import type { ReactNode } from 'react';
import { MapPin, MessageSquare, Route, Settings, Trophy } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ErrorBanner, LoadingState } from '../../components/ui/States';
import { BASE_CHALLENGES } from '../../domain/challenges/baseChallenges';
import { BASE_TRAINING_PLANS } from '../../domain/plans/basePlans';
import { RANKS } from '../../domain/ranks/ranks';
import { DEFAULT_DISTANCE_ROUTES } from '../../domain/distance-equivalences/baseRoutes';
import { useUsers } from '../../services/queries';

export function AdminPage() {
  const usersQuery = useUsers();
  const users = usersQuery.data ?? [];

  if (usersQuery.isPending) return <LoadingState />;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase text-app-accent">Admin</p>
        <h1 className="mt-1 text-3xl font-black text-app-text">Control de producto</h1>
      </header>
      <ErrorBanner error={usersQuery.error} fallback="No se pudieron cargar los usuarios." />
      <section className="grid gap-4 md:grid-cols-4">
        <Card><Badge>Usuarios</Badge><p className="mt-3 text-3xl font-black text-app-text">{users.length}</p></Card>
        <Card><Badge>Retos base</Badge><p className="mt-3 text-3xl font-black text-app-text">{BASE_CHALLENGES.length}</p></Card>
        <Card><Badge>Planes</Badge><p className="mt-3 text-3xl font-black text-app-text">{BASE_TRAINING_PLANS.length}</p></Card>
        <Card><Badge>Rangos</Badge><p className="mt-3 text-3xl font-black text-app-text">{RANKS.length}</p></Card>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <AdminCapability icon={<Trophy size={20} />} title="Gestionar retos" text="Crear retos diarios, semanales, bosses y duelos privados desde Firestore/admin." />
        <AdminCapability icon={<Route size={20} />} title="Rutas globales" text={`${DEFAULT_DISTANCE_ROUTES.length} rutas semilla listas; las globales quedan solo lectura para usuarios.`} />
        <AdminCapability icon={<MapPin size={20} />} title="Planes y rangos" text="Planes, rangos y mensajes motivacionales están separados para evolucionar sin tocar UI." />
        <AdminCapability icon={<MessageSquare size={20} />} title="Mensajes" text="Frases motivacionales preparadas para seeds y futuras campañas." />
      </section>
      <Card>
        <div className="mb-4 flex items-center gap-2 text-app-accent"><Settings size={20} /><strong>Seeds y configuración</strong></div>
        <p className="text-sm text-app-muted">Usa `npm run seed` con credenciales admin de Firebase para cargar rangos, retos, planes, rutas globales y mensajes motivacionales. La elevación a admin debe hacerse desde Firebase Admin SDK o consola, nunca desde la UI de usuario.</p>
      </Card>
      <div className="grid gap-3">
        {users.map((user) => (
          <Card key={user.uid}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><strong className="text-app-text">{user.displayName}</strong><p className="text-sm text-app-muted">{user.email}</p></div>
              <div className="flex gap-2"><Badge>{user.role}</Badge><Badge>{user.xp ?? 0} XP</Badge></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminCapability({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 text-app-accent">{icon}<strong>{title}</strong></div>
      <p className="text-sm text-app-muted">{text}</p>
    </Card>
  );
}
