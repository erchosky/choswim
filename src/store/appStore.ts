import { create } from 'zustand';

interface AppState {
  installPrompt: BeforeInstallPromptEvent | null;
  setInstallPrompt: (event: BeforeInstallPromptEvent | null) => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const useAppStore = create<AppState>((set) => ({
  installPrompt: null,
  setInstallPrompt: (event) => set({ installPrompt: event })
}));
