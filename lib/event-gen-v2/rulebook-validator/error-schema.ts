/**
 * Rulebook Validator v2 - Error schema
 * Structured errors with BLOCK (reject) and WARN (needs review) severity.
 */

export type RulebookErrorSeverity = 'BLOCK' | 'WARN';

export interface RulebookError {
  code: string;
  severity: RulebookErrorSeverity;
  message: string;
  field?: string;
}

/** Error codes for rulebook validation */
export const RULEBOOK_ERROR_CODES = {
  MISSING_BINARY_OUTCOMES: 'MISSING_BINARY_OUTCOMES',
  MISSING_DEADLINE: 'MISSING_DEADLINE',
  MISSING_RESOLUTION_CRITERIA: 'MISSING_RESOLUTION_CRITERIA',
  MISSING_RESOLUTION_SOURCE: 'MISSING_RESOLUTION_SOURCE',
  INVALID_TIMEZONE: 'INVALID_TIMEZONE',
  TITLE_CRITERIA_MISMATCH: 'TITLE_CRITERIA_MISMATCH',
  SOURCE_HIERARCHY_INVALID: 'SOURCE_HIERARCHY_INVALID',
  IMAGE_MISSING: 'IMAGE_MISSING',
  IMAGE_NO_ALT_TEXT: 'IMAGE_NO_ALT_TEXT',
  IMAGE_INVALID: 'IMAGE_INVALID',
  IMAGE_NEW_CLAIMS: 'IMAGE_NEW_CLAIMS',
  TITLE_TOO_SHORT: 'TITLE_TOO_SHORT',
  TITLE_NOT_QUESTION: 'TITLE_NOT_QUESTION',
  TITLE_QUALITY: 'TITLE_QUALITY',
} as const;

export type RulebookErrorCode = (typeof RULEBOOK_ERROR_CODES)[keyof typeof RULEBOOK_ERROR_CODES];
