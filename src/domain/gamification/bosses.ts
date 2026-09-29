export interface WeeklyBoss {
  id: string;
  name: string;
  description: string;
  targetMeters: number;
  difficulty: 'media' | 'alta' | 'épica' | 'legendaria';
  rewardXP: number;
}

export const WEEKLY_BOSSES: WeeklyBoss[] = [
  { id: 'kraken', name: 'Kraken', description: 'Domina la semana con volumen consistente.', targetMeters: 5000, difficulty: 'media', rewardXP: 300 },
  { id: 'megalodon', name: 'Megalodón', description: 'Series largas, cabeza fría y cero excusas.', targetMeters: 9000, difficulty: 'alta', rewardXP: 600 },
  { id: 'leviathan', name: 'Leviatán', description: 'Una semana para nadadores que quieren subir de liga.', targetMeters: 14000, difficulty: 'épica', rewardXP: 950 },
  { id: 'poseidon', name: 'Poseidón', description: 'Boss final semanal: solo si el cuerpo acompaña.', targetMeters: 20000, difficulty: 'legendaria', rewardXP: 1500 }
];

export function getWeeklyBoss(weeklyTargetMeters: number) {
  if (weeklyTargetMeters >= 20000) return WEEKLY_BOSSES[3];
  if (weeklyTargetMeters >= 14000) return WEEKLY_BOSSES[2];
  if (weeklyTargetMeters >= 9000) return WEEKLY_BOSSES[1];
  return WEEKLY_BOSSES[0];
}

export function getBossProgress(weeklyMeters: number, boss: WeeklyBoss) {
  const progressPercent = Math.min(100, Math.round((weeklyMeters / boss.targetMeters) * 100));
  return {
    progressPercent,
    remainingMeters: Math.max(0, boss.targetMeters - weeklyMeters),
    defeated: weeklyMeters >= boss.targetMeters
  };
}
