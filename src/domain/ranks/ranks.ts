export interface Rank {
  name: string;
  minXP: number;
  maxXP: number;
  icon: string;
  description: string;
  token: string;
}

export const RANKS: Rank[] = [
  { name: 'Bronce', minXP: 0, maxXP: 999, icon: 'Medal', description: 'Base solida, ritmo constante.', token: 'from-amber-800 to-orange-400' },
  { name: 'Plata', minXP: 1000, maxXP: 2499, icon: 'Shield', description: 'Ya no vienes a mojarte.', token: 'from-slate-400 to-cyan-200' },
  { name: 'Oro', minXP: 2500, maxXP: 4999, icon: 'Crown', description: 'Entrenos con intencion y progreso visible.', token: 'from-yellow-500 to-amber-200' },
  { name: 'Platino', minXP: 5000, maxXP: 8999, icon: 'Gem', description: 'Volumen serio, tecnica controlada.', token: 'from-cyan-300 to-emerald-200' },
  { name: 'Diamante', minXP: 9000, maxXP: 14999, icon: 'Diamond', description: 'Consistencia premium.', token: 'from-sky-300 to-indigo-300' },
  { name: 'Tiburon', minXP: 15000, maxXP: 23999, icon: 'Waves', description: 'Competitivo, rapido y dificil de alcanzar.', token: 'from-cyan-500 to-blue-500' },
  { name: 'Kraken', minXP: 24000, maxXP: 39999, icon: 'Trophy', description: 'Boss mode desbloqueado.', token: 'from-violet-500 to-fuchsia-500' },
  { name: 'Poseidón', minXP: 40000, maxXP: Number.MAX_SAFE_INTEGER, icon: 'Zap', description: 'Control total del agua.', token: 'from-teal-200 to-yellow-200' }
];

export function getRankForXP(xp: number): Rank {
  return RANKS.find((rank) => xp >= rank.minXP && xp <= rank.maxXP) ?? RANKS[0];
}

export function getNextRank(xp: number): Rank | null {
  const currentIndex = RANKS.findIndex((rank) => xp >= rank.minXP && xp <= rank.maxXP);
  return RANKS[currentIndex + 1] ?? null;
}

export function getRankProgress(xp: number): number {
  const rank = getRankForXP(xp);
  if (rank.maxXP === Number.MAX_SAFE_INTEGER) return 100;
  return Math.min(100, Math.round(((xp - rank.minXP) / (rank.maxXP - rank.minXP + 1)) * 100));
}
