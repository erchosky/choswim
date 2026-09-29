import { describe, expect, it } from 'vitest';
import { fromDateInput } from '../lib/date';
import { loginSchema, profileSchema, registerSchema, swimSessionSchema } from '../lib/validators';

const sessionForm = {
  date: '2026-09-28',
  poolLengthMeters: '25',
  totalDistanceMeters: '1000',
  totalTimeMinutes: '45',
  activeTimeMinutes: '35',
  restTimeMinutes: '10',
  laps: '40',
  style: 'mixed',
  intensity: '6',
  perceivedEffort: '6',
  waterWeights: 'none',
  goal: 'endurance',
  fatigue: '',
  notes: ''
};

const profileForm = {
  displayName: 'Ana',
  heightCm: '170',
  weightKg: '60',
  birthYear: '',
  mainGoal: 'general',
  poolLengthMeters: '25',
  level: 'beginner',
  weeklyTargetMeters: '5000',
  preferredSessionDuration: '45',
  usesWaterWeights: false
};

describe('formularios', () => {
  it('permite guardar una sesión sin rellenar la fatiga', () => {
    const result = swimSessionSchema.safeParse(sessionForm);
    expect(result.success).toBe(true);
    expect(result.data?.fatigue).toBeUndefined();
  });

  it('valida la fatiga cuando se rellena', () => {
    expect(swimSessionSchema.safeParse({ ...sessionForm, fatigue: '11' }).success).toBe(false);
    expect(swimSessionSchema.parse({ ...sessionForm, fatigue: '7' }).fatigue).toBe(7);
  });

  it('el año de nacimiento es opcional', () => {
    expect(profileSchema.parse(profileForm).birthYear).toBeUndefined();
    expect(profileSchema.parse({ ...profileForm, birthYear: '1990' }).birthYear).toBe(1990);
  });

  it('muestra los errores en español', () => {
    const result = registerSchema.safeParse({ email: 'no-es-email', password: '123', displayName: 'A' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'Introduce un email válido',
      'La contraseña debe tener al menos 8 caracteres',
      'Mínimo 2 caracteres'
    ]);
  });

  it('el login no exige la longitud mínima del registro', () => {
    expect(loginSchema.safeParse({ email: 'ana@example.com', password: 'corta' }).success).toBe(true);
  });
});

describe('fechas de sesión manual', () => {
  it('se guardan a mediodía local del día elegido', () => {
    const date = fromDateInput('2026-09-28');
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 8, 28, 12]);
  });
});
