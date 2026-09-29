import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret, defineString } from 'firebase-functions/params';

initializeApp();

export const db = getFirestore();

/** Región de todas las funciones (la PWA llama a europe-west1). */
export const REGION = 'europe-west1';

export const openAiApiKey = defineSecret('OPENAI_API_KEY');
/** Modelo de OpenAI; se puede cambiar sin tocar código con `firebase functions:config` / .env. */
export const openAiModel = defineString('OPENAI_MODEL', { default: 'gpt-4o-mini' });

/** Versión del cálculo guardada en cada sesión procesada. */
export const PROCESSING_VERSION = 3;
