/**
 * Types for the deterministic market validator.
 * Used before market/event creation to reject or flag ambiguous/unresolvable markets.
 */

/** Input payload for validation (market creation candidate). */
export type MarketValidationInput = {
  title: string;
  description?: string | null;
  closesAt: string; // ISO 8601
  resolutionSourceUrl?: string | null;
  resolutionNotes?: string | null;
};

/** Result of running the validator. */
export type ValidationResult = {
  valid: boolean;
  needsReview: boolean;
  reasons: string[];
};
