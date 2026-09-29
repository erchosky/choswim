/**
 * Cloud Functions de ChooseSwim (europe-west1).
 *
 * - stats/triggers: procesan cada sesión (XP, métricas) y mantienen los agregados del usuario.
 * - ai/callables: entrenador IA con límite diario por usuario.
 * - admin/callables: recalcular estadísticas y generar el snapshot del ranking.
 */
export { generateAiSessionReport, generateWeeklyPlan } from './ai/callables.js';
export { recalculateUserStats, updateLeaderboardSnapshot } from './admin/callables.js';
export { onSwimSessionCreated, onSwimSessionDeleted, onSwimSessionUpdated } from './stats/triggers.js';
