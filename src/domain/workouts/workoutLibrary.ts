import type { MainGoal, SwimLevel } from '../../types/models';

export interface WorkoutTemplate {
  id: string;
  title: string;
  goal: MainGoal | 'recovery';
  level: SwimLevel;
  distanceMeters: number;
  durationMinutes: number;
  focus: string;
  warmup: string[];
  mainSet: string[];
  rests: string[];
  cooldown: string[];
  techniqueTips: string[];
}

export const WORKOUT_LIBRARY: WorkoutTemplate[] = [
  {
    id: 'fat-loss-aerobic-1000',
    title: 'Quema estable 1000',
    goal: 'fat_loss',
    level: 'beginner',
    distanceMeters: 1000,
    durationMinutes: 35,
    focus: 'Ritmo aeróbico constante sin disparar fatiga.',
    warmup: ['200m suave', '4x25m técnica de respiración'],
    mainSet: ['6x100m ritmo cómodo', '4x50m progresivos'],
    rests: ['20s entre 100m', '30s entre 50m'],
    cooldown: ['100m espalda suave'],
    techniqueTips: ['Respira sin levantar la cabeza', 'Mantén patada ligera y continua']
  },
  {
    id: 'muscle-water-weights',
    title: 'Fuerza con pesas acuáticas',
    goal: 'muscle_gain',
    level: 'intermediate',
    distanceMeters: 1200,
    durationMinutes: 45,
    focus: 'Fuerza controlada sin perder técnica.',
    warmup: ['300m movilidad y crol suave'],
    mainSet: ['8x50m con pesas ligeras', '6x75m mixto sin pesas'],
    rests: ['30-45s en series con pesas', '25s en mixto'],
    cooldown: ['150m muy suave'],
    techniqueTips: ['Si el hombro protesta, baja carga', 'Prioriza recorrido limpio']
  },
  {
    id: 'endurance-1500',
    title: 'Resistencia 1500',
    goal: 'endurance',
    level: 'intermediate',
    distanceMeters: 1500,
    durationMinutes: 50,
    focus: 'Base de fondo con final sólido.',
    warmup: ['300m suave', '4x50m técnica'],
    mainSet: ['3x300m ritmo estable', '4x50m vivos'],
    rests: ['45s entre 300m', '25s entre 50m'],
    cooldown: ['100m espalda'],
    techniqueTips: ['Cuenta brazadas', 'No salgas demasiado rápido']
  },
  {
    id: 'technique-clean',
    title: 'Técnica limpia',
    goal: 'technique',
    level: 'beginner',
    distanceMeters: 800,
    durationMinutes: 35,
    focus: 'Mejorar agarre, respiración y posición.',
    warmup: ['200m suave'],
    mainSet: ['8x25m punto muerto', '8x25m respiración bilateral', '8x50m integrando técnica'],
    rests: ['20s entre 25m', '30s entre 50m'],
    cooldown: ['100m suave'],
    techniqueTips: ['Codo alto bajo el agua', 'Exhala dentro del agua']
  },
  {
    id: 'speed-rankeds',
    title: 'Velocidad ranked',
    goal: 'speed',
    level: 'advanced',
    distanceMeters: 1100,
    durationMinutes: 45,
    focus: 'Sprints cortos con recuperación real.',
    warmup: ['400m variado'],
    mainSet: ['12x25m rápido', '6x50m a ritmo fuerte'],
    rests: ['45s entre sprints', '60s si pierdes técnica'],
    cooldown: ['200m suave'],
    techniqueTips: ['Explosivo sin desorden', 'Recupera antes de repetir calidad']
  },
  {
    id: 'recovery-soft',
    title: 'Recuperación activa',
    goal: 'recovery',
    level: 'beginner',
    distanceMeters: 700,
    durationMinutes: 30,
    focus: 'Soltar carga y mantener racha.',
    warmup: ['100m suave'],
    mainSet: ['500m continuo fácil'],
    rests: ['Descanso libre si sube la fatiga'],
    cooldown: ['100m espalda o braza suave'],
    techniqueTips: ['Sensación fácil', 'Sales mejor de lo que entraste']
  }
];

export function recommendTemplate(goal: MainGoal, level: SwimLevel) {
  return WORKOUT_LIBRARY.find((workout) => workout.goal === goal && workout.level === level)
    ?? WORKOUT_LIBRARY.find((workout) => workout.goal === goal)
    ?? WORKOUT_LIBRARY[0];
}
