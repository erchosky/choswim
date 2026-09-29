import { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select, Label } from '../../components/ui/Field';
import { recommendTemplate } from '../../domain/workouts/workoutLibrary';
import { generateWeeklyPlan } from '../../services/aiService';
import { goalLabels } from '../../shared/constants/labels';
import { useAuthStore } from '../../store/authStore';
import type { MainGoal } from '../../types/models';

export function AiCoachPage() {
  const { profile } = useAuthStore();
  const [goal, setGoal] = useState<MainGoal>(profile?.mainGoal ?? 'general');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const response = await generateWeeklyPlan(goal);
      setResult(response.plan);
    } catch (error) {
      console.error('[aiCoach] fallback local activado', error);
      const template = recommendTemplate(goal, profile?.level ?? 'beginner');
      setResult([
        'Modo local activado: no hay respuesta disponible de OpenAI o Functions.',
        '',
        `Plan recomendado: ${template.title}`,
        `Objetivo: ${goalLabels[goal]}`,
        `Distancia: ${template.distanceMeters}m · Duración: ${template.durationMinutes} min`,
        '',
        `Calentamiento: ${template.warmup.join(' · ')}`,
        `Bloque principal: ${template.mainSet.join(' · ')}`,
        `Descansos: ${template.rests.join(' · ')}`,
        `Vuelta a la calma: ${template.cooldown.join(' · ')}`,
        '',
        'Aviso de carga: si notas dolor fuerte, mareo o falta de aire intensa, para y consulta a un profesional.'
      ].join('\n'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase text-app-accent">Entrenador IA</p>
        <h1 className="mt-1 text-3xl font-black text-app-text">Entrenador privado</h1>
      </header>
      <Card className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Label htmlFor="ai-goal">Objetivo</Label>
          <Select id="ai-goal" value={goal} onChange={(event) => setGoal(event.target.value as MainGoal)}>
            <option value="fat_loss">{goalLabels.fat_loss}</option>
            <option value="muscle_gain">{goalLabels.muscle_gain}</option>
            <option value="endurance">{goalLabels.endurance}</option>
            <option value="speed">{goalLabels.speed}</option>
            <option value="technique">{goalLabels.technique}</option>
            <option value="general">{goalLabels.general}</option>
          </Select>
        </div>
        <Button onClick={generate} disabled={loading} icon={<Sparkles size={18} />}>Generar plan semanal</Button>
      </Card>
      <Card>
        <div className="mb-3 flex items-center gap-2 text-app-accent"><Bot size={20} /><strong>Salida del entrenador</strong></div>
        <pre className="whitespace-pre-wrap text-sm leading-6 text-app-text" aria-live="polite">{result || 'La IA corre en Cloud Functions. Si no hay OpenAI API, se usa modo local con reglas seguras.'}</pre>
      </Card>
    </div>
  );
}
