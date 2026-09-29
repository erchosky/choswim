import { Loader2 } from 'lucide-react';
import { toVisibleError } from '../../shared/utils/async';
import { Button } from './Button';
import { Card } from './Card';

export function LoadingState({ label = 'Cargando ChooseSwim' }: { label?: string }) {
  return <div className="grid min-h-[40vh] place-items-center text-app-muted"><Loader2 className="mr-2 inline animate-spin" />{label}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: { label: string; onClick: () => void } }) {
  return (
    <Card className="text-center">
      <h2 className="text-lg font-bold text-app-text">{title}</h2>
      <p className="mt-2 text-sm text-app-muted">{description}</p>
      {action ? <Button className="mt-4" onClick={action.onClick}>{action.label}</Button> : null}
    </Card>
  );
}

/** Aviso de error de carga. Acepta el error original o un mensaje ya preparado. */
export function ErrorBanner({ error, fallback = 'Algo ha fallado. Inténtalo de nuevo.' }: { error: unknown; fallback?: string }) {
  if (!error) return null;
  const message = typeof error === 'string' ? error : toVisibleError(error, fallback);
  return <div role="alert" className="rounded-lg border border-app-danger/40 bg-app-danger/10 p-4 text-sm text-app-danger">{message}</div>;
}
