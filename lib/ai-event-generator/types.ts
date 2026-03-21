/**
 * AI Event Generator - Type definitions
 */

import type { Candidate } from '../event-gen-v2/types';
import type { TrendObject } from '../trend-detection/types';

/** Raw candidate from AI (before validation) */
export interface AICandidateEvent {
  category: string;
  subject_entity: string;
  condition: string;
  threshold: string | number;
  deadline: string; // ISO date string
  resolution_source_primary: string;
  resolution_source_secondary?: string;
  resolution_criteria: {
    yes: string;
    no: string;
  };
  /** Optional: question/title for the market */
  title?: string;
  /** Optional: selection reason when AI picks best */
  selection_reason?: string;
}

/** AI response schema - 3 candidates + optional best index */
export interface AIEventGeneratorResponse {
  candidates: AICandidateEvent[];
  best_index?: number; // 0-based index of best candidate
}

export interface GenerateEventsFromTrendParams {
  trend: TrendObject;
  now?: Date;
}

export interface GenerateEventsFromTrendResult {
  candidate: Candidate | null;
  candidatesGenerated: number;
  rejectionReasons: string[];
}

export type RejectionReason =
  | 'MISSING_DEADLINE'
  | 'DEADLINE_IN_PAST'
  | 'MISSING_QUANTIFIABLE_CONDITION'
  | 'MISSING_RESOLUTION_SOURCE'
  | 'MISSING_BINARY_OUTCOME'
  | 'INVALID_STRUCTURE'
  | 'PARSE_ERROR'
  | 'LLM_ERROR';
