import { endOfMonth, endOfWeek, isWithinInterval, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

export function toDate(value: Date | string | Timestamp): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  return value.toDate();
}

export function inCurrentWeek(value: Date | string | Timestamp): boolean {
  const date = toDate(value);
  return isWithinInterval(date, { start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) });
}

export function inCurrentMonth(value: Date | string | Timestamp): boolean {
  const date = toDate(value);
  return isWithinInterval(date, { start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
}

export function isToday(value: Date | string | Timestamp): boolean {
  return startOfDay(toDate(value)).getTime() === startOfDay(new Date()).getTime();
}

/**
 * Fecha de un <input type="date"> (AAAA-MM-DD) como mediodía en hora local.
 * `new Date('2026-09-28')` es medianoche UTC: en España serían las 01:00/02:00 y en
 * América el día anterior, lo que descuadra rachas, semanas y trofeos por hora.
 */
export function fromDateInput(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year!, (month ?? 1) - 1, day ?? 1, 12);
}
