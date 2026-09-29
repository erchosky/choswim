import assert from 'node:assert/strict';
import test from 'node:test';
import { aggregateSessions, calculateXP, computeSession, computeStreakDays, getRankName, rawSessionChanged } from '../src/stats/calculations.js';
import { dayKey, isInWeekOf } from '../src/stats/time.js';

const at = (iso: string) => new Date(iso);
const session = (date: string, extra: Record<string, unknown> = {}) => ({
  date: at(date),
  totalDistanceMeters: 1000,
  activeTimeMinutes: 30,
  intensity: 6,
  perceivedEffort: 6,
  ...extra
});

test('los días se cuentan en hora de España, no en UTC', () => {
  // 23:30 UTC del 28 de septiembre son las 01:30 del 29 en Madrid (horario de verano).
  assert.equal(dayKey(at('2026-09-28T23:30:00Z')), '2026-09-29');
  assert.equal(dayKey(at('2026-09-28T21:30:00Z')), '2026-09-28');
});

test('la semana empieza el lunes (hora de España)', () => {
  const wednesday = at('2026-09-30T10:00:00Z');
  assert.equal(isInWeekOf(at('2026-09-28T08:00:00Z'), wednesday), true); // lunes
  assert.equal(isInWeekOf(at('2026-09-27T21:30:00Z'), wednesday), false); // domingo 23:30 en Madrid
  assert.equal(isInWeekOf(at('2026-09-27T22:30:00Z'), wednesday), true); // lunes 00:30 en Madrid
});

test('la racha termina hoy o ayer y se rompe con un día sin nadar', () => {
  const now = at('2026-09-30T12:00:00Z');
  const days = ['2026-09-30', '2026-09-29', '2026-09-28', '2026-09-26'].map((day) => session(`${day}T10:00:00Z`));
  assert.equal(computeStreakDays(days, now), 3);
  assert.equal(computeStreakDays(days.slice(1), now), 2);
  assert.equal(computeStreakDays([session('2026-09-20T10:00:00Z')], now), 0);
});

test('el bonus de racha usa las sesiones reales, no el perfil desactualizado', () => {
  const oldStreak = ['2026-08-01', '2026-08-02', '2026-08-03'].map((day) => session(`${day}T10:00:00Z`));
  const today = session('2026-09-30T10:00:00Z');
  const withStaleProfile = computeSession(today, { streakDays: 10 }, oldStreak);
  const expectedNoStreak = calculateXP({
    distanceMeters: 1000,
    activeTimeMinutes: 30,
    intensity: 6,
    perceivedEffort: 6,
    pacePer100m: 180,
    previousBestDistance: 1000,
    streakDays: 0
  });
  assert.equal(withStaleProfile.computedXP, expectedNoStreak);

  const yesterday = session('2026-09-29T10:00:00Z');
  assert.ok(computeSession(today, {}, [yesterday]).computedXP > expectedNoStreak);
});

test('los agregados semanales guardan a qué semana pertenecen', () => {
  const now = at('2026-09-30T12:00:00Z');
  const stats = aggregateSessions([
    session('2026-09-29T10:00:00Z', { computedXP: 100 }),
    session('2026-09-10T10:00:00Z', { computedXP: 50, totalDistanceMeters: 2000 })
  ], now);
  assert.equal(stats.xp, 150);
  assert.equal(stats.totalMeters, 3000);
  assert.equal(stats.weeklyMeters, 1000);
  assert.equal(stats.weeklyXP, 100);
  assert.equal(stats.weeklySessionCount, 1);
  assert.equal(typeof stats.weeklyStatsWeekStart, 'number');
  assert.equal(stats.rankName, 'Bronce');
});

test('rangos por XP', () => {
  assert.equal(getRankName(0), 'Bronce');
  assert.equal(getRankName(2500), 'Oro');
  assert.equal(getRankName(50000), 'Poseidón');
});

test('solo se recalcula si cambian datos introducidos por el usuario', () => {
  const before = session('2026-09-29T10:00:00Z');
  assert.equal(rawSessionChanged(before, { ...before, computedXP: 99, processingStatus: 'processed' }), false);
  assert.equal(rawSessionChanged(before, { ...before, totalDistanceMeters: 1200 }), true);
});
