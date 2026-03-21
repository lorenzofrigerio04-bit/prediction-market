/**
 * AI Event Generator - Public API
 * Converts TrendObjects into CandidateEvents using an LLM.
 * Pipeline: TrendObject → AI Event Generator → Candidate
 */

import type { TrendObject } from '../trend-detection/types';
import type { Candidate } from '../event-gen-v2/types';
import { generateEventsFromTrend } from './service';

export { generateEventsFromTrend } from './service';
export type {
  GenerateEventsFromTrendParams,
  GenerateEventsFromTrendResult,
  RejectionReason,
} from './types';

/**
 * Generate CandidateEvents from multiple TrendObjects.
 * Returns Candidate[] compatible with validateCandidates() in the pipeline.
 */
export async function generateEventsFromTrends(
  trends: TrendObject[],
  now: Date = new Date()
): Promise<{ candidates: Candidate[]; rejectionCounts: Record<string, number> }> {
  const candidates: Candidate[] = [];
  const rejectionCounts: Record<string, number> = {};

  for (const trend of trends) {
    const result = await generateEventsFromTrend({ trend, now });
    for (const reason of result.rejectionReasons) {
      rejectionCounts[reason] = (rejectionCounts[reason] ?? 0) + 1;
    }
    if (result.candidate) {
      candidates.push(result.candidate);
    }
  }

  return { candidates, rejectionCounts };
}
