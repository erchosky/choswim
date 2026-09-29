import { buildCoachMessage } from './coachMessage';
import { buildNextAction, buildTechnicalInsight } from './motivationalSummary';
import { headlineFor, summaryFor } from './narrativeTemplates';
import type { SessionNarrative, SessionNarrativeInput } from './types';

export function generateSessionNarrative(input: SessionNarrativeInput): SessionNarrative {
  return {
    headline: headlineFor(input),
    summary: summaryFor(input),
    coachMessage: buildCoachMessage(input),
    technicalInsight: buildTechnicalInsight(input),
    nextAction: buildNextAction(input)
  };
}
