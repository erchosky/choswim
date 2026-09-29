import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FieldError, Input, Label, Select } from '../../components/ui/Field';
import { goals, levels, poolLengths, profileSchema, type ProfileFormValues } from '../../lib/validators';
import { goalLabels, levelLabels } from '../../shared/constants/labels';

export function ProfileForm({ defaultValues, onSubmit, submitLabel = 'Guardar perfil', submittingLabel = 'Guardando perfil...' }: { defaultValues?: Partial<ProfileFormValues>; onSubmit: (values: ProfileFormValues) => Promise<void>; submitLabel?: string; submittingLabel?: string }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<ProfileFormValues>({
    defaultValues: {
      displayName: '',
      heightCm: 175,
      weightKg: 75,
      mainGoal: 'general',
      poolLengthMeters: 25,
      level: 'beginner',
      weeklyTargetMeters: 5000,
      preferredSessionDuration: 45,
      usesWaterWeights: false,
      ...defaultValues
    }
  });

  async function submit(values: ProfileFormValues) {
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => setError(issue.path[0] as keyof ProfileFormValues, { message: issue.message }));
      return;
    }
    await onSubmit(parsed.data);
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submit)}>
      <div className="sm:col-span-2">
        <Label htmlFor="profile-displayName">Nombre visible</Label>
        <Input id="profile-displayName" {...register('displayName')} />
        <FieldError message={errors.displayName?.message} />
      </div>
      <div><Label htmlFor="profile-heightCm">Altura cm</Label><Input id="profile-heightCm" type="number" {...register('heightCm')} /><FieldError message={errors.heightCm?.message} /></div>
      <div><Label htmlFor="profile-weightKg">Peso kg</Label><Input id="profile-weightKg" type="number" {...register('weightKg')} /><FieldError message={errors.weightKg?.message} /></div>
      <div><Label htmlFor="profile-birthYear">Año de nacimiento</Label><Input id="profile-birthYear" type="number" {...register('birthYear')} /><FieldError message={errors.birthYear?.message} /></div>
      <div><Label htmlFor="profile-poolLengthMeters">Piscina</Label><Select id="profile-poolLengthMeters" {...register('poolLengthMeters')}>{poolLengths.map((value) => <option key={value} value={value}>{value}m</option>)}</Select></div>
      <div><Label htmlFor="profile-mainGoal">Objetivo</Label><Select id="profile-mainGoal" {...register('mainGoal')}>{goals.map((goal) => <option key={goal} value={goal}>{goalLabels[goal]}</option>)}</Select></div>
      <div><Label htmlFor="profile-level">Nivel</Label><Select id="profile-level" {...register('level')}>{levels.map((level) => <option key={level} value={level}>{levelLabels[level]}</option>)}</Select></div>
      <div><Label htmlFor="profile-weeklyTargetMeters">Meta semanal metros</Label><Input id="profile-weeklyTargetMeters" type="number" {...register('weeklyTargetMeters')} /><FieldError message={errors.weeklyTargetMeters?.message} /></div>
      <div><Label htmlFor="profile-preferredSessionDuration">Duración preferida min</Label><Input id="profile-preferredSessionDuration" type="number" {...register('preferredSessionDuration')} /><FieldError message={errors.preferredSessionDuration?.message} /></div>
      <label className="flex items-center gap-3 rounded-lg border border-app-line bg-app-bg/55 px-3 py-3 text-sm font-semibold text-app-muted sm:col-span-2">
        <input type="checkbox" className="h-5 w-5 accent-cyan-300" {...register('usesWaterWeights')} />
        Uso pesas acuáticas
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={isSubmitting} icon={<Save size={18} />}>{isSubmitting ? submittingLabel : submitLabel}</Button>
      </div>
    </form>
  );
}
