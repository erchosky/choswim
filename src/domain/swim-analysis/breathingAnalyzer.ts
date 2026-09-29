import type { SwimAnalysisInput } from './types';

export function inferBreathingDifficulty(input: SwimAnalysisInput): number | undefined {
  if (typeof input.breathingDifficulty === 'number') return clamp10(input.breathingDifficulty);
  const text = `${input.breathFeeling ?? ''} ${input.notes ?? ''}`.toLowerCase();
  if (!text.trim()) return undefined;
  if (/(saturad|ahog|aire|respir|ansiedad|tensi|agob)/i.test(text)) return 8;
  if (/(controlad|estable|bien|suave)/i.test(text)) return 3;
  return undefined;
}

export function breathingScore(input: SwimAnalysisInput): number {
  const difficulty = inferBreathingDifficulty(input);
  if (difficulty === undefined) return 55;
  return Math.max(0, Math.round(100 - difficulty * 10));
}

function clamp10(value: number) {
  return Math.max(1, Math.min(10, Math.round(value)));
}
