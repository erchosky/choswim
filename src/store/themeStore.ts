import { create } from 'zustand';

export type ThemePreference = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeState {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  hydrate: () => void;
}

const storageKey = 'chooseswim.theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference;
}

function applyTheme(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  resolvedTheme: getSystemTheme(),
  setPreference: (preference) => {
    const resolvedTheme = resolveTheme(preference);
    localStorage.setItem(storageKey, preference);
    applyTheme(resolvedTheme);
    set({ preference, resolvedTheme });
  },
  hydrate: () => {
    const stored = localStorage.getItem(storageKey) as ThemePreference | null;
    const preference: ThemePreference = stored && ['dark', 'light', 'system'].includes(stored) ? stored : 'system';
    const resolvedTheme = resolveTheme(preference);
    applyTheme(resolvedTheme);
    set({ preference, resolvedTheme });
  }
}));

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    const state = useThemeStore.getState();
    if (state.preference === 'system') {
      const resolvedTheme = getSystemTheme();
      applyTheme(resolvedTheme);
      useThemeStore.setState({ resolvedTheme });
    }
  });
}
