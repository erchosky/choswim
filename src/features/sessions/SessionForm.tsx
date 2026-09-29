import { useForm, useWatch } from 'react-hook-form';
import type { ReactNode } from 'react';
import { Dumbbell, Save, Sparkles, Waves } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FieldError, Input, Label, Select, Textarea } from '../../components/ui/Field';
import { estimateCalories, sessionScore } from '../../domain/swimming/metrics';
import { poolLengths, sessionGoals, styles, swimSessionSchema, waterWeights, type SwimSessionFormValues } from '../../lib/validators';
import { sessionGoalLabels, swimStyleLabels, waterWeightsLabels } from '../../shared/constants/labels';

const presets: Array<{ label: string; icon: ReactNode; values: Partial<SwimSessionFormValues> }> = [
  { label: '500m suave', icon: <Waves size={16} />, values: { totalDistanceMeters: 500, totalTimeMinutes: 25, activeTimeMinutes: 20, restTimeMinutes: 5, laps: 20, intensity: 3, perceivedEffort: 3, goal: 'recovery', style: 'mixed' } },
  { label: '1000m normal', icon: <Sparkles size={16} />, values: { totalDistanceMeters: 1000, totalTimeMinutes: 45, activeTimeMinutes: 35, restTimeMinutes: 10, laps: 40, intensity: 6, perceivedEffort: 6, goal: 'endurance', style: 'mixed' } },
  { label: '1500m intenso', icon: <Sparkles size={16} />, values: { totalDistanceMeters: 1500, totalTimeMinutes: 55, activeTimeMinutes: 45, restTimeMinutes: 10, laps: 60, intensity: 8, perceivedEffort: 8, goal: 'speed', style: 'freestyle' } },
  { label: 'Técnica', icon: <Waves size={16} />, values: { totalDistanceMeters: 800, totalTimeMinutes: 40, activeTimeMinutes: 30, restTimeMinutes: 10, laps: 32, intensity: 4, perceivedEffort: 4, goal: 'technique', style: 'drills' } },
  { label: 'Pesas acuáticas', icon: <Dumbbell size={16} />, values: { totalDistanceMeters: 900, totalTimeMinutes: 45, activeTimeMinutes: 32, restTimeMinutes: 13, laps: 36, intensity: 7, perceivedEffort: 8, goal: 'muscle_gain', waterWeights: 'light' } },
  { label: 'Sin pesas', icon: <Waves size={16} />, values: { waterWeights: 'none' } }
];

export function SessionForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Guardar sesión',
  isSubmitting: isSubmittingExternal = false
}: {
  defaultValues?: Partial<SwimSessionFormValues>;
  onSubmit: (values: SwimSessionFormValues) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, setError, setValue } = useForm<SwimSessionFormValues>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      poolLengthMeters: 25,
      totalDistanceMeters: 1000,
      totalTimeMinutes: 45,
      activeTimeMinutes: 35,
      restTimeMinutes: 10,
      laps: 40,
      style: 'mixed',
      intensity: 6,
      perceivedEffort: 6,
      waterWeights: 'none',
      goal: 'endurance',
      ...defaultValues
    }
  });

  const [distanceValue, activeValue, restValue, intensityValue, effortValue, waterWeight] = useWatch({
    control,
    name: ['totalDistanceMeters', 'activeTimeMinutes', 'restTimeMinutes', 'intensity', 'perceivedEffort', 'waterWeights']
  });
  const distance = Number(distanceValue || 0);
  const active = Number(activeValue || 0);
  const restTimeMinutes = Number(restValue || 0);
  const intensity = Number(intensityValue || 0);
  const perceivedEffort = Number(effortValue || 0);
  const livePace = distance && active ? ((active * 60) / (distance / 100)).toFixed(0) : '--';
  const liveCalories = estimateCalories({ distanceMeters: distance, activeTimeMinutes: active, weightKg: 75, intensity, waterWeights: waterWeight });
  const liveScore = sessionScore({ totalDistanceMeters: distance, activeTimeMinutes: active, intensity, perceivedEffort, restTimeMinutes });

  const submitting = isSubmitting || isSubmittingExternal;

  function applyPreset(values: Partial<SwimSessionFormValues>) {
    Object.entries(values).forEach(([key, value]) => setValue(key as keyof SwimSessionFormValues, value as never, { shouldValidate: true, shouldDirty: true }));
  }

  async function submit(values: SwimSessionFormValues) {
    const parsed = swimSessionSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => setError(issue.path[0] as keyof SwimSessionFormValues, { message: issue.message }));
      return;
    }
    await onSubmit(parsed.data);
  }

  return (
    <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit(submit)}>
      <div className="md:col-span-3">
        <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-app-muted">Presets rápidos</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button key={preset.label} type="button" variant="secondary" icon={preset.icon} onClick={() => applyPreset(preset.values)} disabled={submitting}>
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
      <div><Label htmlFor="session-date">Fecha</Label><Input id="session-date" type="date" {...register('date')} /><FieldError message={errors.date?.message} /></div>
      <div><Label htmlFor="session-poolLengthMeters">Piscina</Label><Select id="session-poolLengthMeters" {...register('poolLengthMeters')}>{poolLengths.map((value) => <option key={value} value={value}>{value}m</option>)}</Select></div>
      <div><Label htmlFor="session-laps">Vueltas</Label><Input id="session-laps" type="number" {...register('laps')} /><FieldError message={errors.laps?.message} /></div>
      <div><Label htmlFor="session-totalDistanceMeters">Distancia total</Label><Input id="session-totalDistanceMeters" type="number" {...register('totalDistanceMeters')} /><FieldError message={errors.totalDistanceMeters?.message} /></div>
      <div><Label htmlFor="session-totalTimeMinutes">Tiempo total min</Label><Input id="session-totalTimeMinutes" type="number" {...register('totalTimeMinutes')} /><FieldError message={errors.totalTimeMinutes?.message} /></div>
      <div><Label htmlFor="session-activeTimeMinutes">Activo min</Label><Input id="session-activeTimeMinutes" type="number" {...register('activeTimeMinutes')} /><FieldError message={errors.activeTimeMinutes?.message} /></div>
      <div><Label htmlFor="session-restTimeMinutes">Descanso min</Label><Input id="session-restTimeMinutes" type="number" {...register('restTimeMinutes')} /><FieldError message={errors.restTimeMinutes?.message} /></div>
      <div><Label htmlFor="session-style">Estilo</Label><Select id="session-style" {...register('style')}>{styles.map((style) => <option key={style} value={style}>{swimStyleLabels[style]}</option>)}</Select></div>
      <div><Label htmlFor="session-goal">Objetivo</Label><Select id="session-goal" {...register('goal')}>{sessionGoals.map((goal) => <option key={goal} value={goal}>{sessionGoalLabels[goal]}</option>)}</Select></div>
      <div><Label htmlFor="session-intensity">Intensidad 1-10</Label><Input id="session-intensity" type="number" min={1} max={10} {...register('intensity')} /><FieldError message={errors.intensity?.message} /></div>
      <div><Label htmlFor="session-perceivedEffort">Esfuerzo 1-10</Label><Input id="session-perceivedEffort" type="number" min={1} max={10} {...register('perceivedEffort')} /><FieldError message={errors.perceivedEffort?.message} /></div>
      <div><Label htmlFor="session-waterWeights">Pesas acuáticas</Label><Select id="session-waterWeights" {...register('waterWeights')}>{waterWeights.map((value) => <option key={value} value={value}>{waterWeightsLabels[value]}</option>)}</Select></div>
      <div><Label htmlFor="session-fatigue">Fatiga</Label><Input id="session-fatigue" type="number" min={1} max={10} {...register('fatigue')} /><FieldError message={errors.fatigue?.message} /></div>
      <div><Label htmlFor="session-moodBefore">Antes</Label><Input id="session-moodBefore" {...register('moodBefore')} placeholder="cansado, fuerte..." /></div>
      <div><Label htmlFor="session-moodAfter">Despues</Label><Input id="session-moodAfter" {...register('moodAfter')} placeholder="ligero, reventado..." /></div>
      <div className="md:col-span-3"><Label htmlFor="session-breathFeeling">Respiracion</Label><Input id="session-breathFeeling" {...register('breathFeeling')} placeholder="estable, agitada, controlada..." /></div>
      <div className="md:col-span-3"><Label htmlFor="session-painNotes">Dolor o molestias</Label><Input id="session-painNotes" {...register('painNotes')} placeholder="si hay dolor fuerte, para y consulta a un profesional" /></div>
      <div className="md:col-span-3"><Label htmlFor="session-notes">Notas</Label><Textarea id="session-notes" {...register('notes')} /></div>
      <div className="grid gap-3 rounded-lg border border-app-line bg-app-bg/55 p-3 text-sm text-app-muted md:col-span-3 sm:grid-cols-4">
        <div><span>Ritmo</span><strong className="mt-1 block text-app-text">{livePace}s / 100m</strong></div>
        <div><span>Calorías estimadas</span><strong className="mt-1 block text-app-text">{liveCalories} kcal</strong></div>
        <div><span>Score sesión</span><strong className="mt-1 block text-app-text">{liveScore}/100</strong></div>
        <div className="flex flex-wrap items-end gap-2"><Badge>{waterWeightsLabels[waterWeight]}</Badge>{intensity >= 8 ? <Badge>Intenso</Badge> : null}</div>
      </div>
      <div className="md:col-span-3">
        <Button disabled={submitting} icon={<Save size={18} />}>{submitLabel}</Button>
      </div>
    </form>
  );
}
