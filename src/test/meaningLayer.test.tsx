import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { analyzeSession } from '../domain/swim-analysis/analyzeSession';
import { calculateVirtualProgress } from '../domain/geo-progress/calculateVirtualProgress';
import { calculateSymbolicRouteProgress } from '../domain/geo-progress/routeProgress';
import { SessionMeaningCard } from '../features/session-meaning/components/SessionMeaningCard';

describe('meaning layer', () => {
  it('classifies low heart rate plus high fatigue and breathing difficulty as respiratory', () => {
    const result = analyzeSession({
      distanceMeters: 520,
      totalTimeMinutes: 21,
      activeTimeMinutes: 17,
      restTimeMinutes: 4,
      avgHeartRate: 121,
      perceivedFatigue: 8,
      breathingDifficulty: 8
    });

    expect(result.fatigueType).toBe('respiratory');
    expect(result.mainLimiter).toBe('breathing');
  });

  it('detects low consistency with very variable SWOLF', () => {
    const result = analyzeSession({
      distanceMeters: 1000,
      totalTimeMinutes: 35,
      activeTimeMinutes: 30,
      bestSwolf: 36,
      avgSwolf: 52,
      worstSwolf: 71
    });

    expect(result.consistency).toBe('low');
  });

  it('calculates valid geo progress for 520m from the start point', () => {
    const result = calculateVirtualProgress({
      start: { lat: 40.4169, lng: -3.7035 },
      distanceMeters: 520
    });

    expect(result.distanceMeters).toBe(520);
    expect(result.virtualPoint.lat).not.toBe(40.4169);
    expect(result.milestone.progressPercent).toBe(52);
  });

  it('does not crash with sparse legacy sessions', () => {
    const result = analyzeSession({ distanceMeters: 0 });

    expect(result.fatigueType).toBe('unknown');
    expect(result.score.breathing).toBeGreaterThanOrEqual(0);
  });

  it('renders UI fallback for old sessions without stored analysis', () => {
    const html = renderToStaticMarkup(<SessionMeaningCard session={{ totalDistanceMeters: 520 }} />);

    expect(html).toContain('Lectura del entreno');
  });

  it('calculates Casa -> Piscina progress at 52% for 520m', () => {
    const result = calculateSymbolicRouteProgress(520, {
      name: 'Casa -> Piscina',
      totalDistanceMeters: 1000
    });

    expect(result.progressPercent).toBe(52);
    expect(result.remainingMeters).toBe(480);
  });
});
