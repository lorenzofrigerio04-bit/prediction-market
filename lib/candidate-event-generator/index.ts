/**
 * Candidate Event Generator - Public API
 * Input: TrendObjects
 * Output: StructuredCandidateEvents (deterministic, verifiable)
 */

import type { TrendObject } from '../trend-detection/types';
import type { StructuredCandidateEvent } from '../candidate-event-templates/types';
import type { Candidate } from '../event-gen-v2/types';
import { generateCandidateEvents } from './algorithm';

export { generateCandidateEvents, extractResolutionSources } from './algorithm';
export type { GenerateResult, RejectionReason } from './algorithm';
export type { StructuredCandidateEvent } from '../candidate-event-templates/types';

/**
 * Map StructuredCandidateEvent to Candidate for pipeline integration.
 */
export function toPipelineCandidate(
  event: StructuredCandidateEvent,
  sourceStorylineId?: string
): Candidate {
  const id = sourceStorylineId ?? `trend:${event.sourceTrendTopic ?? 'unknown'}`;
  const resolutionUrl = event.resolution_sources[0] ?? '';
  let resolutionAuthorityHost = 'example.com';
  try {
    resolutionAuthorityHost = new URL(resolutionUrl).hostname;
  } catch {
    // keep default
  }

  return {
    title: event.title,
    description: event.templateId,
    category: event.category,
    closesAt: event.deadline,
    resolutionAuthorityHost,
    resolutionAuthorityType: 'REPUTABLE',
    resolutionCriteriaYes: event.resolutionCriteriaYes,
    resolutionCriteriaNo: event.resolutionCriteriaNo,
    sourceStorylineId: id,
    templateId: event.templateId,
    resolutionSourceUrl: resolutionUrl || null,
    timezone: 'Europe/Rome',
    resolutionCriteriaFull: `${event.resolutionCriteriaYes} | ${event.resolutionCriteriaNo}`,
  };
}

/**
 * Main entry: generate CandidateEvents from TrendObjects.
 */
export async function generateFromTrends(
  trends: TrendObject[],
  now: Date = new Date()
): Promise<{ candidates: StructuredCandidateEvent[]; rejectionCounts: Record<string, number> }> {
  const result = generateCandidateEvents(trends, now);
  return {
    candidates: result.candidates,
    rejectionCounts: result.rejectionCounts as Record<string, number>,
  };
}
