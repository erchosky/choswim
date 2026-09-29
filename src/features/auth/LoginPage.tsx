import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { Lock, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FieldError, Input, Label } from '../../components/ui/Field';
import { isFirebaseConfigured } from '../../lib/env';
import { loginSchema } from '../../lib/validators';
import { loginWithEmail, resetPassword } from '../../services/authService';

type LoginValues = { email: string; password: string };

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues, setError: setFieldError } = useForm<LoginValues>();

  async function onSubmit(values: LoginValues) {
    setError('');
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => setFieldError(issue.path[0] as keyof LoginValues, { message: issue.message }));
      return;
    }
    try {
      await loginWithEmail(parsed.data.email, parsed.data.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('[auth] login failed', err);
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    }
  }

  async function handleReset() {
    setError('');
    setInfo('');
    const email = getValues('email');
    if (!email) {
      setError('Escribe tu email para recuperar la contrasena.');
      return;
    }
    try {
      await resetPassword(email);
      setInfo('Email de recuperacion enviado.');
    } catch (err) {
      console.error('[auth] password reset failed', err);
      setError(err instanceof Error ? err.message : 'No se pudo enviar el email de recuperación.');
    }
  }

  return (
    <Card>
      {!isFirebaseConfigured ? <p className="mb-4 rounded-lg border border-coral/40 bg-coral/10 p-3 text-sm text-rose-100">Configura Firebase en `.env.local` antes de usar auth.</p> : null}
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" autoComplete="email" placeholder="chosky@email.com" {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="login-password">Contraseña</Label>
          <Input id="login-password" type="password" autoComplete="current-password" placeholder="Mínimo 8 caracteres" {...register('password')} />
          <FieldError message={errors.password?.message} />
        </div>
        {error ? <p className="text-sm text-coral" role="alert">{error}</p> : null}
        {info ? <p className="text-sm text-reef" role="status">{info}</p> : null}
        <Button type="submit" className="w-full" disabled={isSubmitting} icon={<Lock size={18} />}>{isSubmitting ? 'Entrando...' : 'Entrar'}</Button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm">
        <button className="text-app-muted hover:text-app-accent" onClick={handleReset} type="button">Recuperar</button>
        <Link className="inline-flex items-center gap-1 font-semibold text-app-accent" to="/register"><Mail size={16} />Crear cuenta</Link>
      </div>
    </Card>
  );
}
