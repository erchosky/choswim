import { Dumbbell } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { BASE_TRAINING_PLANS } from '../../domain/plans/basePlans';
import { levelLabels, sessionGoalLabels } from '../../shared/constants/labels';

export function PlansPage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase text-app-accent">Planes</p>
        <h1 className="mt-1 text-3xl font-black text-app-text">Entrenamiento estructurado</h1>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {BASE_TRAINING_PLANS.map((plan) => (
          <Card key={plan.id}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-app-text">{plan.title}</h2>
                <p className="mt-1 text-sm text-app-muted">{plan.durationWeeks} semanas · {plan.sessionsPerWeek} sesiones/semana</p>
              </div>
              <div className="rounded-lg bg-app-accent/12 p-2 text-app-accent"><Dumbbell size={20} /></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2"><Badge>{sessionGoalLabels[plan.objective]}</Badge><Badge>{levelLabels[plan.difficulty]}</Badge></div>
            <ol className="mt-4 grid gap-2 text-sm text-app-muted">
              {plan.progression.map((step, index) => <li key={`${plan.id}-${index}`}>{step}</li>)}
            </ol>
          </Card>
        ))}
      </div>
    </div>
  );
}
