import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { UserPlus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FieldError, Input, Label } from '../../components/ui/Field';
import { registerSchema } from '../../lib/validators';
import { registerWithEmail } from '../../services/authService';

type RegisterValues = { email: string; password: string; displayName: string };

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError: setFieldError } = useForm<RegisterValues>();

  async function onSubmit(values: RegisterValues) {
    setError('');
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => setFieldError(issue.path[0] as keyof RegisterValues, { message: issue.message }));
      return;
    }
    try {
      await registerWithEmail(parsed.data.email, parsed.data.password, parsed.data.displayName);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      console.error('[auth] register failed', err);
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    }
  }

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="register-name">Nombre</Label>
          <Input id="register-name" autoComplete="name" placeholder="Chosky" {...register('displayName')} />
          <FieldError message={errors.displayName?.message} />
        </div>
        <div>
          <Label htmlFor="register-email">Email</Label>
          <Input id="register-email" type="email" autoComplete="email" {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="register-password">Contraseña</Label>
          <Input id="register-password" type="password" autoComplete="new-password" {...register('password')} />
          <FieldError message={errors.password?.message} />
        </div>
        {error ? <p className="text-sm text-coral" role="alert">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={isSubmitting} icon={<UserPlus size={18} />}>{isSubmitting ? 'Creando cuenta...' : 'Crear perfil'}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-app-muted">Ya tienes cuenta <Link className="font-semibold text-app-accent" to="/login">Entrar</Link></p>
    </Card>
  );
}
