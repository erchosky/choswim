import type { MainGoal, SwimLevel } from '../../types/models';

export function recommendNextWorkout(input: {
  mainGoal: MainGoal;
  level: SwimLevel;
  weeklyMeters: number;
  weeklyTargetMeters: number;
  sessionsWeek: number;
}) {
  const remaining = Math.max(0, input.weeklyTargetMeters - input.weeklyMeters);
  if (input.sessionsWeek === 0) return 'Hoy toca arrancar semana: 500-800m suaves, técnica limpia y salir con ganas de repetir.';
  if (remaining <= 0) return 'Meta semanal completada. Haz sesión técnica o recuperación activa para consolidar sin sobrecargar.';
  if (input.mainGoal === 'speed') return 'Próximo entreno: calentamiento + 12x25m rápidos con descanso amplio + vuelta a la calma.';
  if (input.mainGoal === 'technique') return 'Próximo entreno: drills de respiración y agarre, bloques cortos y ritmo controlado.';
  if (input.mainGoal === 'muscle_gain') return 'Próximo entreno: técnica con pesas ligeras, series de 50m y descansos completos.';
  if (input.mainGoal === 'fat_loss') return `Próximo entreno: ${Math.min(1200, Math.max(600, remaining))}m aeróbicos con ritmo estable.`;
  return `Te faltan ${remaining.toLocaleString('es-ES')}m para la meta. Haz una sesión de ${Math.min(1500, Math.max(800, remaining))}m controlada.`;
}
