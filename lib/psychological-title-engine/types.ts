/**
 * Psychological Title Engine - Type definitions
 */

import type { StructuredCandidateEvent } from '../candidate-event-templates/types';

/** A generated title variant before scoring */
export interface TitleVariant {
  title: string;
  patternId: string;
}

/** Score breakdown for a title variant */
export interface TitleScore {
  clarity: number;
  tension: number;
  brevity: number;
  combined: number;
  details?: {
    hasEntity?: boolean;
    hasThreshold?: boolean;
    hasDeadline?: boolean;
    noBlockedWords?: boolean;
    singleCondition?: boolean;
    usesTensionVerb?: boolean;
    endsWithQuestion?: boolean;
    length?: number;
  };
}

/** Scored variant ready for selection */
export interface ScoredVariant extends TitleVariant {
  score: TitleScore;
}

/** Pattern definition for title generation */
export interface TitlePattern {
  id: string;
  template: string;
  placeholders: ('ENTITY' | 'THRESHOLD' | 'DATE' | 'TOURNAMENT' | 'PRODUCT' | 'METRIC')[];
}

/** Configuration for the title engine */
export interface TitleEngineConfig {
  /** Min length (chars) - target range start */
  minLength?: number;
  /** Target max length (chars) - ideal range end */
  targetMaxLength?: number;
  /** Hard max length (chars) - reject if exceeded */
  hardMaxLength?: number;
  /** Scoring weights: clarity, tension, brevity */
  weights?: { clarity: number; tension: number; brevity: number };
  /** Locale for date formatting */
  locale?: string;
}

/** Input for the title engine */
export type TitleEngineInput = StructuredCandidateEvent;
