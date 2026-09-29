import { HttpsError } from 'firebase-functions/v2/https';
import type { z } from 'zod';
import { db } from './config.js';

export async function requireUser(uid: string | undefined) {
  if (!uid) throw new HttpsError('unauthenticated', 'Necesitas iniciar sesión.');
  const snapshot = await db.doc(`users/${uid}`).get();
  if (!snapshot.exists) throw new HttpsError('failed-precondition', 'Completa el perfil primero.');
  return { uid, profile: snapshot.data()! };
}

export async function requireAdmin(uid: string | undefined) {
  const user = await requireUser(uid);
  if (user.profile.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Solo un admin puede ejecutar esta operación.');
  }
  return user;
}

export function parseCallable<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpsError('invalid-argument', result.error.issues[0]?.message ?? 'Parámetros inválidos.');
  }
  return result.data;
}
