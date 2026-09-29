export type RankedCategory = 'breathing' | 'consistency' | 'technique' | 'endurance' | 'flow' | 'discipline';

export interface RankedBreakdown {
  category: RankedCategory;
  label: string;
  rank: string;
  progressToNext: number;
  reason: string;
}
