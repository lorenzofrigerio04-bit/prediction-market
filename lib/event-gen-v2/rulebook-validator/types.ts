/**
 * Rulebook Validator v2 - Extended validation input
 */

import type { ImageBrief } from '../types';

/** Extended input for rulebook v2 validation (Candidate + optional image) */
export interface RulebookV2Input {
  title: string;
  description?: string | null;
  closesAt: string; // ISO 8601
  resolutionSourceUrl?: string | null;
  resolutionNotes?: string | null;
  /** v2: required for BINARY/THRESHOLD */
  resolutionCriteriaYes?: string | null;
  resolutionCriteriaNo?: string | null;
  /** v2: single text for multi-outcome or fallback */
  resolutionCriteriaFull?: string | null;
  /** v2: if present must be Europe/Rome */
  timezone?: string | null;
  /** v2: source hierarchy */
  resolutionSourceSecondary?: string | null;
  resolutionSourceTertiary?: string | null;
  /** v2: for publish-time image validation */
  imageBrief?: ImageBrief | null;
  /** v2: BINARY | MULTIPLE_CHOICE | RANGE | etc. When multi-option, binary Yes/No not required */
  marketType?: string | null;
  /** v2: for multi-outcome markets [{ key, label }] */
  outcomes?: unknown;
  /** v2: e.g. sport-football-fixture → deadline può essere < 24h (fine partita) */
  templateId?: string | null;
}

import type { RulebookError } from './error-schema';

/** Result of rulebook v2 validation */
export interface RulebookV2Result {
  valid: boolean;
  needsReview: boolean;
  errors: RulebookError[];
}
