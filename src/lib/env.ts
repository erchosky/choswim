/** Emuladores locales de Firebase (npm run emulators): no hace falta un proyecto real. */
export const useFirebaseEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

const DEMO_PROJECT_ID = 'demo-chooseswim';

export const firebaseConfig = useFirebaseEmulators
  ? {
      // Los proyectos "demo-*" solo existen en los emuladores; no necesitan claves reales.
      apiKey: 'demo-api-key',
      authDomain: `${DEMO_PROJECT_ID}.firebaseapp.com`,
      projectId: DEMO_PROJECT_ID,
      appId: 'demo-app-id'
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
      appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined
    };

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
