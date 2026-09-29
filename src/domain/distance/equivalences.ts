import type { LocationSymbol } from '../../types/models';

export function describeDistance(distanceMeters: number, locations: LocationSymbol[] = []): string {
  const sorted = [...locations].filter((location) => location.distanceMeters > 0).sort((a, b) => a.distanceMeters - b.distanceMeters);
  const closest = sorted.find((location) => distanceMeters >= location.distanceMeters * 0.85) ?? sorted[0];

  if (!closest) {
    return distanceMeters >= 14000
      ? 'Has completado un cruce serio tipo Marruecos -> Espana.'
      : `Has nadado ${distanceMeters.toLocaleString('es-ES')} metros.`;
  }

  const times = distanceMeters / closest.distanceMeters;
  if (times >= 1) {
    return `Hoy has nadado como ir a ${closest.name}${times >= 2 ? ` ${times.toFixed(1)} veces` : ''}.`;
  }

  return `Te falta un ${Math.round((1 - times) * 100)}% para llegar nadando a ${closest.name}.`;
}

export function bossProgress(distanceMeters: number, targetMeters: number, label: string): string {
  const percent = Math.min(100, Math.round((distanceMeters / targetMeters) * 100));
  return percent >= 100 ? `Has completado ${label}.` : `Has completado el ${percent}% de ${label}.`;
}
