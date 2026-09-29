import { Dumbbell, Waves } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { WORKOUT_LIBRARY } from '../../domain/workouts/workoutLibrary';
import { levelLabels, sessionGoalLabels } from '../../shared/constants/labels';

export function WorkoutLibraryPage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase text-app-accent">Biblioteca</p>
        <h1 className="mt-1 text-3xl font-black text-app-text">Entrenamientos y drills</h1>
        <p className="mt-2 max-w-2xl text-sm text-app-muted">Sesiones listas para elegir según objetivo, nivel y fatiga. Úsalas como punto de partida y ajusta descanso si el cuerpo lo pide.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {WORKOUT_LIBRARY.map((workout) => (
          <Card key={workout.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-app-text">{workout.title}</h2>
                <p className="mt-1 text-sm text-app-muted">{workout.focus}</p>
              </div>
              <div className="rounded-lg bg-app-accent/12 p-2 text-app-accent"><Waves size={20} /></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{sessionGoalLabels[workout.goal]}</Badge>
              <Badge>{levelLabels[workout.level]}</Badge>
              <Badge>{workout.distanceMeters}m</Badge>
              <Badge>{workout.durationMinutes} min</Badge>
            </div>
            <div className="mt-4 grid gap-4 text-sm text-app-muted sm:grid-cols-2">
              <Block title="Calentamiento" items={workout.warmup} />
              <Block title="Bloque principal" items={workout.mainSet} />
              <Block title="Descansos" items={workout.rests} />
              <Block title="Vuelta a la calma" items={workout.cooldown} />
            </div>
            <div className="mt-4 rounded-lg border border-app-line bg-app-bg/45 p-3">
              <div className="mb-2 flex items-center gap-2 text-app-accent"><Dumbbell size={16} /><strong className="text-sm">Consejos técnicos</strong></div>
              <ul className="space-y-1 text-sm text-app-muted">
                {workout.techniqueTips.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-bold text-app-text">{title}</h3>
      <ul className="mt-2 space-y-1">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
