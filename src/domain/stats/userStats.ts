import { inCurrentMonth, inCurrentWeek, isToday } from '../../lib/date';
import type { SwimSession } from '../../types/models';

export function aggregateStats(sessions: SwimSession[]) {
  const today = sessions.filter((session) => isToday(session.date));
  const week = sessions.filter((session) => inCurrentWeek(session.date));
  const month = sessions.filter((session) => inCurrentMonth(session.date));
  const totalDistance = sessions.reduce((sum, session) => sum + session.totalDistanceMeters, 0);
  const totalMinutes = sessions.reduce((sum, session) => sum + session.activeTimeMinutes, 0);
  const weightedPaceDistance = sessions.reduce((sum, session) => sum + (session.pacePer100m > 0 ? session.totalDistanceMeters : 0), 0);
  const weightedPace = sessions.reduce((sum, session) => sum + session.pacePer100m * session.totalDistanceMeters, 0);
  const positivePaces = sessions.map((session) => session.pacePer100m).filter((pace) => pace > 0);

  return {
    metersToday: today.reduce((sum, session) => sum + session.totalDistanceMeters, 0),
    metersWeek: week.reduce((sum, session) => sum + session.totalDistanceMeters, 0),
    metersMonth: month.reduce((sum, session) => sum + session.totalDistanceMeters, 0),
    sessionsWeek: week.length,
    totalDistance,
    totalMinutes,
    averagePace: weightedPaceDistance ? weightedPace / weightedPaceDistance : 0,
    bestPace: positivePaces.length ? Math.min(...positivePaces) : 0,
    xpWeek: week.reduce((sum, session) => sum + session.xpGained, 0),
    lastSession: sessions[0] ?? null,
    chartData: [...sessions]
      .reverse()
      .slice(-12)
      .map((session) => ({
        date: new Date(typeof session.date === 'string' ? session.date : 'toDate' in session.date ? session.date.toDate() : session.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        meters: session.totalDistanceMeters,
        xp: session.xpGained
      }))
  };
}
