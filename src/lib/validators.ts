import { z } from 'zod';

// Mensajes por defecto de Zod en español; los campos clave llevan además su propio mensaje.
z.config(z.locales.es());

/** Número opcional de un <input type="number">: vacío significa "sin dato", no 0. */
function optionalNumber(min: number, max: number) {
  return z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : value),
    z.coerce.number().min(min).max(max).optional()
  );
}

export const goals = ['fat_loss', 'muscle_gain', 'endurance', 'speed', 'technique', 'general'] as const;
export const sessionGoals = [...goals, 'recovery'] as const;
export const levels = ['beginner', 'intermediate', 'advanced'] as const;
export const poolLengths = [20, 25, 50] as const;
export const styles = ['freestyle', 'breaststroke', 'backstroke', 'butterfly', 'mixed', 'drills'] as const;
export const waterWeights = ['none', 'light', 'medium', 'heavy'] as const;

const emailSchema = z.string().trim().pipe(z.email('Introduce un email válido'));

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  displayName: z.string().trim().min(2, 'Mínimo 2 caracteres').max(40, 'Máximo 40 caracteres')
});

// El login no aplica la política de contraseñas del registro: solo comprueba que haya una.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Introduce tu contraseña')
});

export const profileSchema = z.object({
  displayName: z.string().min(2).max(40),
  heightCm: z.coerce.number().min(120).max(230),
  weightKg: z.coerce.number().min(35).max(180),
  birthYear: optionalNumber(1940, new Date().getFullYear()),
  mainGoal: z.enum(goals),
  poolLengthMeters: z.coerce.number().refine((value): value is 20 | 25 | 50 => poolLengths.includes(value as 20 | 25 | 50)),
  level: z.enum(levels),
  weeklyTargetMeters: z.coerce.number().min(500).max(100000),
  preferredSessionDuration: z.coerce.number().min(10).max(180),
  usesWaterWeights: z.boolean().default(false)
});

export const swimSessionSchema = z.object({
  date: z.string().min(1),
  poolLengthMeters: z.coerce.number().refine((value): value is 20 | 25 | 50 => poolLengths.includes(value as 20 | 25 | 50)),
  totalDistanceMeters: z.coerce.number().min(25).max(50000),
  totalTimeMinutes: z.coerce.number().min(1).max(600),
  activeTimeMinutes: z.coerce.number().min(1).max(600),
  restTimeMinutes: z.coerce.number().min(0).max(300),
  laps: z.coerce.number().min(1).max(5000),
  style: z.enum(styles),
  intensity: z.coerce.number().min(1).max(10),
  perceivedEffort: z.coerce.number().min(1).max(10),
  waterWeights: z.enum(waterWeights),
  goal: z.enum(sessionGoals),
  notes: z.string().max(1000).optional(),
  moodBefore: z.string().max(80).optional(),
  moodAfter: z.string().max(80).optional(),
  fatigue: optionalNumber(1, 10),
  painNotes: z.string().max(400).optional(),
  breathFeeling: z.string().max(140).optional()
}).refine((data) => data.activeTimeMinutes + data.restTimeMinutes <= data.totalTimeMinutes + 5, {
  message: 'Tiempo activo + descanso no puede superar claramente el tiempo total',
  path: ['activeTimeMinutes']
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type SwimSessionFormValues = z.infer<typeof swimSessionSchema>;
