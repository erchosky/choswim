import OpenAI from 'openai';
import { openAiApiKey, openAiModel } from '../config.js';

const SYSTEM_PROMPT =
  'Eres el entrenador de ChooseSwim. No das diagnóstico médico. Si hay dolor fuerte, falta de aire intensa, mareo o ' +
  'síntomas preocupantes, recomiendas parar y consultar a un profesional. Tono motivador, directo, estilo gaming, en ' +
  'español y sin vender humo.';

const FALLBACK_WITHOUT_KEY =
  'La IA no está configurada en el servidor (falta OPENAI_API_KEY). Mientras tanto: revisa carga, técnica y progresión ' +
  'sin buscar diagnóstico médico.';

function getApiKey() {
  try {
    return openAiApiKey.value() || process.env.OPENAI_API_KEY;
  } catch {
    // En el emulador sin secretos definidos value() lanza; se usa la variable de entorno.
    return process.env.OPENAI_API_KEY;
  }
}

export function isAiConfigured() {
  return Boolean(getApiKey());
}

export async function coachCompletion(prompt: string) {
  const apiKey = getApiKey();
  if (!apiKey) return FALLBACK_WITHOUT_KEY;

  const openai = new OpenAI({ apiKey, timeout: 20_000, maxRetries: 1 });
  const response = await openai.chat.completions.create({
    model: openAiModel.value(),
    temperature: 0.7,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]
  });
  return response.choices[0]?.message?.content ?? 'No se pudo generar respuesta.';
}

/** Solo los datos del perfil que necesita el entrenador (sin email ni datos personales). */
export function safeProfile(profile: Record<string, unknown>) {
  return {
    level: profile.level,
    mainGoal: profile.mainGoal,
    weeklyTargetMeters: profile.weeklyTargetMeters,
    preferredSessionDuration: profile.preferredSessionDuration,
    poolLengthMeters: profile.poolLengthMeters
  };
}

export function trimSession(session: Record<string, unknown> | undefined) {
  if (!session) return {};
  return {
    date: session.date,
    distance: session.totalDistanceMeters,
    activeMinutes: session.activeTimeMinutes,
    pacePer100m: session.pacePer100m,
    intensity: session.intensity,
    perceivedEffort: session.perceivedEffort,
    goal: session.goal,
    painNotes: String(session.painNotes ?? '').slice(0, 160),
    breathFeeling: String(session.breathFeeling ?? '').slice(0, 160)
  };
}
