import { describe, expect, it } from 'vitest';
import { getNextRank, getRankForXP, getRankProgress } from '../domain/ranks/ranks';

describe('ranks', () => {
  it('maps xp to ranks', () => {
    expect(getRankForXP(0).name).toBe('Bronce');
    expect(getRankForXP(2500).name).toBe('Oro');
    expect(getRankForXP(40000).name).toBe('Poseidón');
  });

  it('calculates progress and next rank', () => {
    expect(getRankProgress(500)).toBeGreaterThan(0);
    expect(getNextRank(500)?.name).toBe('Plata');
  });
});
