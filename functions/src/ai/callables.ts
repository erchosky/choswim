import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { db, openAiApiKey, REGION } from '../config.js';
import { parseCallable, requireUser } from '../guards.js';
import { enforceDailyLimit } from '../rate-limit.js';
import { coachCompletion, isAiConfigured, safeProfile, trimSession } from './coach.js';

const DAILY_LIMITS = { sessionReport: 8, weeklyPlan: 5 } as const;

async function saveReport(data: Record<string, unknown>) {
  await db.collection('aiReports').add({ ...data, createdAt: FieldValue.serverTimestamp() });
}

export const generateAiSessionReport = onCall({ region: REGION, secrets: [openAiApiKey] }, async (request) => {
  const { sessionId } = parseCallable(z.object({ sessionId: z.string().min(1).max(120) }), request.data);
  const { uid, profile } = await requireUser(request.auth?.uid);
  const session = await db.doc(`swimSessions/${sessionId}`).get();
  if (!session.exists || session.data()?.userId !== uid) {
    throw new HttpsError('permission-denied', 'Sesión no disponible.');
  }
  // Sin IA configurada no se consume el cupo diario ni se guarda un informe vacío.
  if (isAiConfigured()) await enforceDailyLimit(uid, 'sessionReport', DAILY_LIMITS.sessionReport);

  const report = await coachCompletion(
    `Perfil resumido: ${JSON.stringify(safeProfile(profile))}\n` +
    `Sesión: ${JSON.stringify(trimSession(session.data()))}\n` +
    'Genera resumen post-entreno, patrones, recomendación siguiente y aviso de carga si procede. Máximo 1200 caracteres.'
  );
  if (isAiConfigured()) await saveReport({ userId: uid, sessionId, type: 'session', report });
  return { report };
});

export const generateWeeklyPlan = onCall({ region: REGION, secrets: [openAiApiKey] }, async (request) => {
  const { goal } = parseCallable(z.object({ goal: z.string().min(1).max(40) }), request.data);
  const { uid, profile } = await requireUser(request.auth?.uid);
  if (isAiConfigured()) await enforceDailyLimit(uid, 'weeklyPlan', DAILY_LIMITS.weeklyPlan);

  const sessions = await db.collection('swimSessions').where('userId', '==', uid).orderBy('date', 'desc').limit(8).get();
  const plan = await coachCompletion(
    `Perfil resumido: ${JSON.stringify(safeProfile(profile))}\n` +
    `Objetivo: ${goal}\n` +
    `Últimas sesiones: ${JSON.stringify(sessions.docs.map((doc) => trimSession(doc.data())))}\n` +
    'Crea plan semanal con sesiones, descansos, foco técnico y control de carga. Máximo 1600 caracteres.'
  );
  if (isAiConfigured()) await saveReport({ userId: uid, type: 'weeklyPlan', report: plan });
  return { plan };
});
