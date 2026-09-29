import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { firebaseConfig, isFirebaseConfigured, useFirebaseEmulators } from './env';

const FUNCTIONS_REGION = 'europe-west1';
const EMULATOR_HOST = '127.0.0.1';

const app = isFirebaseConfigured ? getApps()[0] ?? initializeApp(firebaseConfig) : undefined;

function createFirestore() {
  if (!app) return undefined;
  // Los campos opcionales vacíos llegan como `undefined`; sin esta opción Firestore rechaza la escritura.
  const baseSettings = { ignoreUndefinedProperties: true };
  try {
    return initializeFirestore(app, {
      ...baseSettings,
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch (error) {
    console.warn('[firebase] No se pudo activar la cache persistente de Firestore. Se usa cache en memoria.', error);
    try {
      return initializeFirestore(app, baseSettings);
    } catch {
      // Ya inicializado (recarga en caliente): se reutiliza la instancia existente.
      return getFirestore(app);
    }
  }
}

export const auth = app ? getAuth(app) : undefined;
export const db = createFirestore();
export const functions = app ? getFunctions(app, FUNCTIONS_REGION) : undefined;

if (useFirebaseEmulators && auth && db && functions) {
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
  connectFunctionsEmulator(functions, EMULATOR_HOST, 5001);
}

export function requireFirebase() {
  if (!app || !auth || !db || !functions) {
    throw new Error('Firebase no está configurado. Copia .env.example a .env.local y completa las claves Vite.');
  }
  return { app, auth, db, functions };
}
