import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { toDate } from '../../lib/date';
import type { SwimSession } from '../../types/models';

export function calculateTrainingStreak(sessions: Pick<SwimSession, 'date'>[], now = new Date()) {
  const uniqueDays = [...new Set(sessions.map((session) => startOfDay(toDate(session.date)).getTime()))].sort((a, b) => b - a);
  if (!uniqueDays.length) {
    return { streakDays: 0, trainedToday: false, atRisk: false, message: 'Aún no hay racha. Hoy puede ser el día 1.' };
  }

  const today = startOfDay(now).getTime();
  const trainedToday = uniqueDays[0] === today;
  const firstDayDelta = differenceInCalendarDays(today, new Date(uniqueDays[0]));
  const atRisk = !trainedToday && firstDayDelta === 1;
  let streakDays = trainedToday || atRisk ? 1 : 0;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const expectedPrevious = uniqueDays[index - 1] - 86400000;
    if (uniqueDays[index] === expectedPrevious) streakDays += 1;
    else break;
  }

  return {
    streakDays,
    trainedToday,
    atRisk,
    message: atRisk
      ? 'Tu racha está en peligro: una sesión corta hoy la mantiene viva.'
      : trainedToday
        ? 'Racha protegida hoy. Buen trabajo.'
        : 'Entrena hoy para arrancar una nueva racha.'
  };
}
