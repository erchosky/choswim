import type { TrainingPlan } from '../../types/models';

export const BASE_TRAINING_PLANS: TrainingPlan[] = [
  {
    id: 'fat-loss-6w',
    title: 'Perder grasa sin quemarte',
    objective: 'fat_loss',
    durationWeeks: 6,
    sessionsPerWeek: 3,
    difficulty: 'beginner',
    progression: ['Base aerobica', 'Intervalos cortos', 'Mayor densidad', 'Descarga activa', 'Bloque fuerte', 'Test final'],
    sessions: [
      { title: 'Aerobico estable', warmup: '200m suave', main: '8x100m ritmo comodo', cooldown: '100m espalda suave' },
      { title: 'Intervalos controlados', warmup: '300m tecnica', main: '12x50m vivo con 20s descanso', cooldown: '100m suave' }
    ]
  },
  {
    id: 'water-muscle-8w',
    title: 'Musculo en agua',
    objective: 'muscle_gain',
    durationWeeks: 8,
    sessionsPerWeek: 3,
    difficulty: 'intermediate',
    progression: ['Tecnica con lastre', 'Volumen', 'Series potentes', 'Descarga', 'Bloque mixto', 'Potencia', 'Densidad', 'Test'],
    sessions: [
      { title: 'Fuerza tecnica', warmup: '250m movilidad', main: '10x50m con pesas ligeras alternando tecnica', cooldown: '150m suave' }
    ]
  },
  {
    id: 'endurance-10w',
    title: 'Resistencia seria',
    objective: 'endurance',
    durationWeeks: 10,
    sessionsPerWeek: 4,
    difficulty: 'intermediate',
    progression: ['Base', 'Volumen', 'Tempo', 'Descarga', 'Volumen+', 'Umbral', 'Bloque largo', 'Descarga', 'Afinar', 'Test'],
    sessions: [
      { title: 'Fondo progresivo', warmup: '400m suave', main: '3x500m progresivos', cooldown: '200m tecnica' }
    ]
  },
  {
    id: 'technique-4w',
    title: 'Tecnica limpia',
    objective: 'technique',
    durationWeeks: 4,
    sessionsPerWeek: 2,
    difficulty: 'beginner',
    progression: ['Respiracion', 'Agarre', 'Rolido', 'Integracion'],
    sessions: [
      { title: 'Drills de control', warmup: '200m suave', main: '12x25m drills + 12x25m nado consciente', cooldown: '100m suave' }
    ]
  },
  {
    id: 'speed-6w',
    title: 'Velocidad rankeds',
    objective: 'speed',
    durationWeeks: 6,
    sessionsPerWeek: 3,
    difficulty: 'advanced',
    progression: ['Tecnica rapida', 'Sprints', 'Pace', 'Descarga', 'Bloque fuerte', 'Test 100m'],
    sessions: [
      { title: 'Sprints cortos', warmup: '500m variado', main: '16x25m rapido con recuperacion completa', cooldown: '200m suave' }
    ]
  },
  {
    id: 'recovery-3w',
    title: 'Recuperacion activa',
    objective: 'recovery',
    durationWeeks: 3,
    sessionsPerWeek: 2,
    difficulty: 'beginner',
    progression: ['Soltar', 'Movilidad', 'Reentrada'],
    sessions: [
      { title: 'Soltar carga', warmup: '100m suave', main: '600m continuo facil', cooldown: '100m espalda' }
    ]
  }
];
