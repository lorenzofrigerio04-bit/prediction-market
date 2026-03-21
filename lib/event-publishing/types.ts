/**
 * Types for Event Publishing (BLOCCO 5)
 */

import type { Candidate as CanonicalPipelineCandidate } from '../event-gen-v2/types';

export interface QualityScores {
  trend_score: number;
  clarity_score: number;
  psychological_score: number;
  resolution_score: number;
  novelty_score: number;
  image_score: number;
  overall_score: number;
}

export interface ScoredCandidate extends CanonicalPipelineCandidate {
  score: number;
  scoreBreakdown: {
    momentum: number;
    novelty: number;
    authority: number;
    clarity: number;
  };
  qualityScores?: QualityScores;
  overall_score?: number;
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
