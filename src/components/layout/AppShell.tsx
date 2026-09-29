import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { Bot, Dumbbell, History, Home, Library, LogOut, MapPin, Medal, Plus, Shield, Trophy, User, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../services/authService';
import { getRankForXP } from '../../domain/ranks/ranks';
import { InstallPromptButton } from './InstallPromptButton';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../ui/utils';
import { logErrorOnce } from '../../shared/utils/async';

const nav = [
  { to: '/dashboard', label: 'Panel', icon: Home },
  { to: '/sessions', label: 'Entrenos', icon: History },
  { to: '/sessions/new', label: 'Nuevo', icon: Plus },
  { to: '/challenges', label: 'Retos', icon: Trophy },
  { to: '/achievements', label: 'Logros', icon: Medal },
  { to: '/leaderboard', label: 'Ranking', icon: Users },
  { to: '/workouts', label: 'Biblioteca', icon: Library },
  { to: '/plans', label: 'Planes', icon: Dumbbell },
  { to: '/distance-routes', label: 'Rutas', icon: MapPin },
  { to: '/ai-coach', label: 'IA', icon: Bot },
  { to: '/ranked', label: 'Rangos', icon: Medal },
  { to: '/profile', label: 'Perfil', icon: User }
];

export function AppShell() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const rank = getRankForXP(profile?.xp ?? 0);
  const desktopNav = profile?.role === 'admin' ? [...nav, { to: '/admin', label: 'Admin', icon: Shield }] : nav;

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      logErrorOnce('[appShell] logout failed', error);
    }
  }

  return (
    <div className="min-h-screen pb-24 text-app-text lg:pb-0">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-app-line bg-app-bg p-5 lg:block">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-app-accent text-xl font-black text-app-bg">CS</div>
          <div>
            <p className="text-lg font-black text-app-text">ChooseSwim</p>
            <p className="text-xs text-app-muted">Natación ranked privada</p>
          </div>
        </Link>
        <div className="mt-6 rounded-lg border border-app-line bg-app-panel p-3">
          <p className="text-sm font-semibold text-app-text">{profile?.displayName}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge>{rank.name}</Badge>
            <span className="text-xs text-app-muted">{profile?.xp ?? 0} XP</span>
          </div>
        </div>
        <nav className="mt-6 space-y-1">
          {desktopNav.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 space-y-2">
          <ThemeToggle />
          <InstallPromptButton />
          <Button variant="ghost" className="w-full justify-start" icon={<LogOut size={18} />} onClick={handleLogout}>Salir</Button>
        </div>
      </aside>

      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-app-line bg-app-bg px-2 py-2 lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {nav.slice(0, 5).map((item) => <BottomItem key={item.to} {...item} />)}
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-app-muted transition hover:bg-app-surface/70', isActive && 'bg-app-accent text-app-bg hover:bg-app-accent')}
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

function BottomItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn('flex min-h-[58px] flex-col items-center justify-center rounded-lg text-[11px] font-semibold text-app-muted', isActive && 'bg-app-accent text-app-bg')}
    >
      <Icon size={19} />
      <span className="mt-1">{label}</span>
    </NavLink>
  );
}
