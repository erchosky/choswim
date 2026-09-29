import { FieldValue } from 'firebase-admin/firestore';
import { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { db, PROCESSING_VERSION, REGION } from '../config.js';
import { aggregateSessions, computeSession, rawSessionChanged, type SessionData } from './calculations.js';

const SESSION_DOCUMENT = 'swimSessions/{sessionId}';

async function loadUserSessions(userId: string) {
  const snapshot = await db.collection('swimSessions').where('userId', '==', userId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
}

async function writeUserStats(userId: string, sessions: SessionData[], xpDelta = 0) {
  await db.doc(`users/${userId}`).set(
    { ...aggregateSessions(sessions), lastXPDelta: xpDelta, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
}

/** Calcula XP y métricas de la sesión y recalcula los agregados del usuario (una sola lectura). */
async function processSessionWrite(sessionId: string, session: SessionData, previous?: SessionData) {
  const userId = typeof session.userId === 'string' ? session.userId : undefined;
  if (!userId) return;

  const [profileSnapshot, userSessions] = await Promise.all([db.doc(`users/${userId}`).get(), loadUserSessions(userId)]);
  const otherSessions = userSessions.filter((item) => item.id !== sessionId).map((item) => item.data);
  const computed = computeSession(session, profileSnapshot.data() ?? {}, otherSessions);
  const xpDelta = computed.computedXP - Number(previous?.computedXP ?? previous?.xpGained ?? 0);

  // Esta escritura vuelve a disparar onSwimSessionUpdated, que la ignora porque no cambia ningún dato crudo.
  await db.doc(`swimSessions/${sessionId}`).set(
    {
      ...computed,
      xpGained: computed.computedXP,
      processingStatus: 'processed',
      processedAt: FieldValue.serverTimestamp(),
      processingVersion: PROCESSING_VERSION
    },
    { merge: true }
  );

  const processedSession = { ...session, ...computed, xpGained: computed.computedXP };
  await writeUserStats(userId, [...otherSessions, processedSession], xpDelta);
}

export const onSwimSessionCreated = onDocumentCreated({ region: REGION, document: SESSION_DOCUMENT }, async (event) => {
  if (!event.data) return;
  await processSessionWrite(event.data.id, event.data.data());
});

export const onSwimSessionUpdated = onDocumentUpdated({ region: REGION, document: SESSION_DOCUMENT }, async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after || !rawSessionChanged(before, after)) return;
  await processSessionWrite(event.params.sessionId, after, before);
});

export const onSwimSessionDeleted = onDocumentDeleted({ region: REGION, document: SESSION_DOCUMENT }, async (event) => {
  const userId = event.data?.data().userId;
  if (typeof userId !== 'string') return;
  const sessions = await loadUserSessions(userId);
  await writeUserStats(userId, sessions.map((item) => item.data));
});

export async function rebuildUserStats(userId: string) {
  const sessions = (await loadUserSessions(userId)).map((item) => item.data);
  await writeUserStats(userId, sessions);
  return sessions.length;
}
