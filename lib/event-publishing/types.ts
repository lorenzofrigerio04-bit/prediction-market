/**
 * Types for Event Publishing (BLOCCO 5)
 */

import type { GeneratedEventCandidate } from '../event-generation-v2';

export interface ScoredCandidate extends GeneratedEventCandidate {
  score: number;
  scoreBreakdown: {
    momentum: number;
    novelty: number;
    authority: number;
    clarity: number;
  };
}

export interface PublishResult {
  eligibleStorylinesCount: number;
  candidatesCount: number;
  verifiedCandidatesCount: number;
  dedupedCandidatesCount: number;
  selectedCount: number;
  createdCount: number;
  skippedCount: number;
  reasonsCount: Record<string, number>;
}
