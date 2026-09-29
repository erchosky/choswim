import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { BASE_CHALLENGES } from '../src/domain/challenges/baseChallenges';
import { BASE_TRAINING_PLANS } from '../src/domain/plans/basePlans';
import { RANKS } from '../src/domain/ranks/ranks';
import { DEFAULT_DISTANCE_ROUTES } from '../src/domain/distance-equivalences/baseRoutes';

// Con el emulador (FIRESTORE_EMULATOR_HOST definido) no hacen falta credenciales.
if (process.env.FIRESTORE_EMULATOR_HOST) {
  initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'demo-chooseswim' });
} else {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!serviceAccountPath) {
    throw new Error('Define GOOGLE_APPLICATION_CREDENTIALS con la ruta al service account JSON (o usa el emulador).');
  }
  const serviceAccount = await import(serviceAccountPath, { with: { type: 'json' } });
  initializeApp({ credential: cert(serviceAccount.default) });
}

const db = getFirestore();

await db.doc('appConfig/ranks').set({ ranks: RANKS, updatedAt: new Date() });

for (const challenge of BASE_CHALLENGES) {
  await db.doc(`challenges/${challenge.id}`).set(challenge, { merge: true });
}

for (const plan of BASE_TRAINING_PLANS) {
  await db.doc(`trainingPlans/${plan.id}`).set(plan, { merge: true });
}

for (const route of DEFAULT_DISTANCE_ROUTES) {
  await db.doc(`distanceRoutes/${route.id}`).set({ ...route, userId: 'global', updatedAt: new Date() }, { merge: true });
}

const messages = [
  'Hoy no vienes a mojarte, vienes a sumar XP.',
  'Ritmo limpio, cabeza fria, metros al banco.',
  'Si hay dolor raro o falta de aire fuerte, paras y consultas. Progresar no es jugar a romperse.',
  'Un entreno serio cuenta aunque no sea perfecto.'
];

for (const [index, message] of messages.entries()) {
  await db.doc(`motivationalMessages/base-${index + 1}`).set({ message, tone: 'chosky', active: true });
}

console.log('ChooseSwim seeds cargados.');
