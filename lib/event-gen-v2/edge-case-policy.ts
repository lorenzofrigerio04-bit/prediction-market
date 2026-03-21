/**
 * Edge case policy reference for market resolution.
 * Used when validator flags ambiguous timing, subjective wording, etc.
 */

export const EdgeCasePolicyRef = {
  DEFAULT: 'DEFAULT',
  TIMING_EDGE: 'TIMING_EDGE', // e.g. "by midnight", "end of day"
  AMBIGUOUS: 'AMBIGUOUS', // wording may need manual review
  SUBJECTIVE: 'SUBJECTIVE', // subjective interpretation risk
  MULTIPLE_SOURCES: 'MULTIPLE_SOURCES',
  SOURCE_UNCERTAIN: 'SOURCE_UNCERTAIN',
} as const;

export type EdgeCasePolicyRef =
  (typeof EdgeCasePolicyRef)[keyof typeof EdgeCasePolicyRef];
