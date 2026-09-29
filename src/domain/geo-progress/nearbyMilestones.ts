import type { SymbolicMilestone } from './types';

const defaultMilestones: SymbolicMilestone[] = [
  { name: 'Primer tramo del barrio', distanceMeters: 1000, emotionalMessage: 'Ya has salido simbólicamente de la puerta de casa.' },
  { name: 'Media ruta local', distanceMeters: 2500, emotionalMessage: 'Empieza a sentirse como una ruta real.' },
  { name: 'Ruta seria', distanceMeters: 5000, emotionalMessage: 'Esto ya no es calentamiento: es consistencia acumulada.' }
];

export function findNextMilestone(distanceMeters: number, milestones: SymbolicMilestone[] = defaultMilestones) {
  const ordered = [...milestones].sort((a, b) => a.distanceMeters - b.distanceMeters);
  const next = ordered.find((milestone) => distanceMeters < milestone.distanceMeters) ?? ordered[ordered.length - 1] ?? defaultMilestones[0];
  const progressPercent = Math.min(100, Math.round((distanceMeters / Math.max(1, next.distanceMeters)) * 100));
  return {
    name: next.name,
    distanceToNext: Math.max(0, Math.ceil(next.distanceMeters - distanceMeters)),
    progressPercent,
    emotionalMessage: next.emotionalMessage
  };
}
