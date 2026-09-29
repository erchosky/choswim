import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { db, REGION } from '../config.js';
import { parseCallable, requireAdmin } from '../guards.js';
import { dayNumber, weekStartDay } from '../stats/time.js';
import { rebuildUserStats } from '../stats/triggers.js';

const LEADERBOARD_SIZE = 50;

export const recalculateUserStats = onCall({ region: REGION }, async (request) => {
  const admin = await requireAdmin(request.auth?.uid);
  const { uid = admin.uid } = parseCallable(z.object({ uid: z.string().min(1).max(160).optional() }), request.data ?? {});
  const userSnapshot = await db.doc(`users/${uid}`).get();
  if (!userSnapshot.exists) throw new HttpsError('not-found', 'Usuario no encontrado.');
  const sessions = await rebuildUserStats(uid);
  const xp = Number((await db.doc(`users/${uid}`).get()).data()?.xp ?? 0);
  return { xp, sessions };
});

export const updateLeaderboardSnapshot = onCall({ region: REGION }, async (request) => {
  await requireAdmin(request.auth?.uid);
  const now = new Date();
  const currentWeek = weekStartDay(now);
  const today = dayNumber(now);
  const users = await db.collection('users').orderBy('xp', 'desc').limit(LEADERBOARD_SIZE).get();

  const entries = users.docs.map((doc) => {
    const data = doc.data();
    // Los agregados semanales solo se recalculan al registrar sesiones: si son de otra semana, valen 0.
    const weeklyIsCurrent = Number(data.weeklyStatsWeekStart) === currentWeek;
    return {
      userId: doc.id,
      displayName: String(data.displayName ?? 'Nadador'),
      weeklyMeters: weeklyIsCurrent ? Number(data.weeklyMeters ?? 0) : 0,
      weeklyXP: weeklyIsCurrent ? Number(data.weeklyXP ?? 0) : 0,
      sessions: weeklyIsCurrent ? Number(data.weeklySessionCount ?? 0) : 0,
      // La racha solo sigue viva si la última sesión fue hoy o ayer.
      streak: Number(data.lastSessionDay) >= today - 1 ? Number(data.streakDays ?? 0) : 0,
      bestPace: Number(data.bestPace ?? 0),
      challengesCompleted: Number(data.challengesCompleted ?? 0),
      improvement: Number(data.improvement ?? 0)
    };
  });

  await db.collection('leaderboardSnapshots').add({ period: 'manual', entries, createdAt: FieldValue.serverTimestamp() });
  return { entries };
});
