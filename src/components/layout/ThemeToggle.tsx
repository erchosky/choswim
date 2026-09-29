import { Moon, Monitor, Sun } from 'lucide-react';
import { updateThemePreference } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { type ThemePreference, useThemeStore } from '../../store/themeStore';
import { Button } from '../ui/Button';

const nextTheme: Record<ThemePreference, ThemePreference> = {
  system: 'dark',
  dark: 'light',
  light: 'system'
};

const labels: Record<ThemePreference, string> = {
  system: 'Sistema',
  dark: 'Oscuro',
  light: 'Claro'
};

export function ThemeToggle() {
  const { preference, setPreference } = useThemeStore();
  const { profile } = useAuthStore();
  const Icon = preference === 'dark' ? Moon : preference === 'light' ? Sun : Monitor;

  async function toggle() {
    const value = nextTheme[preference];
    setPreference(value);
    if (profile) {
      try {
        await updateThemePreference(profile.uid, value);
      } catch (error) {
        console.error('[theme] no se pudo guardar preferencia', error);
      }
    }
  }

  return (
    <Button variant="secondary" className="w-full justify-start" icon={<Icon size={18} />} onClick={toggle}>
      Tema: {labels[preference]}
    </Button>
  );
}
