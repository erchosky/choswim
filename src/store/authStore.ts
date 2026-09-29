import { onAuthStateChanged, type User } from 'firebase/auth';
import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { getUserProfile } from '../services/authService';
import { toVisibleError } from '../shared/utils/async';
import { useThemeStore } from './themeStore';
import type { UserProfile } from '../types/models';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  setProfile: (profile: UserProfile | null) => void;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  error: null,
  setProfile: (profile) => set({ profile }),
  clearError: () => set({ error: null }),
  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;
    set({ loading: true, error: null });
    try {
      const profile = await getUserProfile(user.uid);
      set({ profile, loading: false });
    } catch (error) {
      const message = toVisibleError(error, 'No se pudo refrescar el perfil.');
      console.error('[auth] refreshProfile failed', error);
      set({ error: message, loading: false });
      throw error;
    }
  }
}));

export function startAuthListener() {
  if (!auth) {
    useAuthStore.setState({ loading: false, initialized: true, error: null });
    return () => undefined;
  }

  return onAuthStateChanged(auth, async (user) => {
    useAuthStore.setState({ user, loading: true, initialized: true, error: null });
    try {
      const profile = user ? await getUserProfile(user.uid) : null;
      if (profile?.themePreference) {
        useThemeStore.getState().setPreference(profile.themePreference);
      }
      useAuthStore.setState({ user, profile, loading: false, error: null });
    } catch (error) {
      const message = toVisibleError(error, 'No se pudo cargar el perfil de usuario.');
      console.error('[auth] getUserProfile failed', error);
      useAuthStore.setState({ user, profile: null, loading: false, error: message });
    }
  });
}
