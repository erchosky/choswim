import type { ReactNode } from 'react';
import { Card } from './Card';

export function StatCard({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }) {
  return (
    <Card className="min-h-[112px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-app-muted">{label}</p>
          <div className="mt-2 text-2xl font-bold text-app-text">{value}</div>
          {hint ? <p className="mt-1 text-xs text-app-muted">{hint}</p> : null}
        </div>
        {icon ? <div className="rounded-lg bg-app-accent/12 p-2 text-app-accent">{icon}</div> : null}
      </div>
    </Card>
  );
}
