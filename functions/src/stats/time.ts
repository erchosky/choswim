/**
 * Fechas en la zona horaria de la app. Cloud Functions corre en UTC: sin esto, una
 * sesión a las 00:30 en España contaría para el día (y la semana) anterior.
 */
export const APP_TIME_ZONE = 'Europe/Madrid';

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short'
});

const WEEKDAY_FROM_MONDAY: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

function zonedParts(date: Date) {
  const parts = Object.fromEntries(partsFormatter.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekdayFromMonday: WEEKDAY_FROM_MONDAY[parts.weekday ?? 'Mon'] ?? 0
  };
}

/** Número de día (entero) en la zona de la app; dos fechas del mismo día local dan el mismo número. */
export function dayNumber(date: Date): number {
  const { year, month, day } = zonedParts(date);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

/** AAAA-MM-DD en la zona de la app. */
export function dayKey(date: Date): string {
  const { year, month, day } = zonedParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Día (número) del lunes de la semana de `date`. */
export function weekStartDay(date: Date): number {
  return dayNumber(date) - zonedParts(date).weekdayFromMonday;
}

export function isInWeekOf(value: Date, reference: Date): boolean {
  const start = weekStartDay(reference);
  const day = dayNumber(value);
  return day >= start && day < start + 7;
}

/** Firestore Timestamp, Date o cadena ISO. */
export function asDate(value: unknown): Date {
  if (value && typeof (value as { toDate?: unknown }).toDate === 'function') return (value as { toDate: () => Date }).toDate();
  if (value instanceof Date) return value;
  return new Date(String(value));
}
