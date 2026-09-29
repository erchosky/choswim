import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from './config.js';
import { dayKey } from './stats/time.js';

/** Límite diario por usuario y operación, en un documento por día (transaccional). */
export async function enforceDailyLimit(uid: string, key: string, limit: number) {
  const day = dayKey(new Date());
  const ref = db.doc(`rateLimits/${uid}_${key}_${day}`);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const count = Number(snapshot.data()?.count ?? 0);
    if (count >= limit) {
      throw new HttpsError('resource-exhausted', 'Has alcanzado el límite diario de IA. Vuelve mañana.');
    }
    transaction.set(ref, { uid, key, day, count: count + 1, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });
}
