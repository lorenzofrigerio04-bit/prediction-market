/**
 * Rulebook Validator v2 - Image compliance rules
 * Image must exist, contain alt text, and not introduce new claims.
 */

import type { ImageBrief } from '../types';
import type { RulebookError } from './error-schema';
import { RULEBOOK_ERROR_CODES } from './error-schema';
import { validateImageBrief } from '../../image-brief-engine/validate';

const ALT_TEXT_MIN = 90;
const ALT_TEXT_MAX = 140;

/** Outcome-spoiler patterns that indicate image introduces claims not in market */
const OUTCOME_SPOILER_PATTERNS = [
  /\b(?:has|have)\s+already\s+(?:reached|hit|passed|exceeded)\b/i,
  /\b(?:reached|hit|passed|exceeded)\s+already\b/i,
  /\b(?:will|would)\s+(?:win|winning|won)\b/i,
  /\b(?:has|have)\s+(?:won|won)\b/i,
  /\b(?:confirmed|announced|declared)\s+(?:winner|victory)\b/i,
  /\b(?:outcome|result)\s+(?:is|was)\s+(?:yes|no|positive|negative)\b/i,
  /\b(?:already|già)\s+(?:risolto|confermato)\b/i,
  /\b(?:sì|no)\s+(?:confermato|annunciato)\b/i,
  /\b(?:prezzo|price)\s+(?:è|is)\s+(?:salito|sceso|above|below)\b/i,
];

/** Check image brief exists when required */
export function checkImageExists(
  imageBrief: ImageBrief | null | undefined,
  required: boolean = true
): RulebookError | null {
  if (!required) return null;
  if (!imageBrief || typeof imageBrief !== 'object') {
    return {
      code: RULEBOOK_ERROR_CODES.IMAGE_MISSING,
      severity: 'BLOCK',
      message: 'Image brief is required',
      field: 'imageBrief',
    };
  }
  return null;
}

/** Check alt text exists and meets length requirements */
export function checkImageAltText(brief: ImageBrief | null | undefined): RulebookError | null {
  if (!brief) return null;
  const alt = brief.alt_text?.trim();
  if (!alt) {
    return {
      code: RULEBOOK_ERROR_CODES.IMAGE_NO_ALT_TEXT,
      severity: 'BLOCK',
      message: 'Image must contain alt text',
      field: 'alt_text',
    };
  }
  if (alt.length < ALT_TEXT_MIN) {
    return {
      code: RULEBOOK_ERROR_CODES.IMAGE_NO_ALT_TEXT,
      severity: 'BLOCK',
      message: `Image alt text must be at least ${ALT_TEXT_MIN} characters (got ${alt.length})`,
      field: 'alt_text',
    };
  }
  if (alt.length > ALT_TEXT_MAX) {
    return {
      code: RULEBOOK_ERROR_CODES.IMAGE_NO_ALT_TEXT,
      severity: 'BLOCK',
      message: `Image alt text must be at most ${ALT_TEXT_MAX} characters (got ${alt.length})`,
      field: 'alt_text',
    };
  }
  return null;
}

/** Check image prompt/alt does not introduce outcome claims not in title + criteria */
export function checkImageNoNewClaims(
  brief: ImageBrief | null | undefined,
  title: string,
  resolutionCriteria: string
): RulebookError | null {
  if (!brief) return null;

  const textToCheck = [
    brief.final_prompt ?? '',
    brief.alt_text ?? '',
    brief.scene_description ?? '',
  ].join(' ');

  if (!textToCheck.trim()) return null;

  const allowedContext = `${title} ${resolutionCriteria}`.toLowerCase();

  for (const pattern of OUTCOME_SPOILER_PATTERNS) {
    const match = textToCheck.match(pattern);
    if (match) {
      // Pattern found in image - check if it's also in allowed context
      const matchStr = match[0].toLowerCase();
      if (!allowedContext.includes(matchStr)) {
        return {
          code: RULEBOOK_ERROR_CODES.IMAGE_NEW_CLAIMS,
          severity: 'WARN',
          message: `Image must not introduce new claims: prompt/alt text contains outcome-spoiler "${match[0]}"`,
          field: 'imageBrief',
        };
      }
    }
  }

  return null;
}

/** Run all image compliance checks. Returns BLOCK + WARN errors. */
export function checkImageCompliance(
  brief: ImageBrief | null | undefined,
  title: string,
  resolutionCriteria: string,
  options?: { required?: boolean }
): RulebookError[] {
  const errors: RulebookError[] = [];
  const required = options?.required ?? true;

  const existsErr = checkImageExists(brief, required);
  if (existsErr) {
    errors.push(existsErr);
    return errors; // No point checking further if no brief
  }

  if (!brief) return errors;

  const altErr = checkImageAltText(brief);
  if (altErr) errors.push(altErr);

  // Also validate structure via image-brief-engine
  const structResult = validateImageBrief(brief);
  if (!structResult.valid) {
    for (const msg of structResult.errors) {
      const isAltRelated = msg.toLowerCase().includes('alt_text');
      errors.push({
        code: isAltRelated ? RULEBOOK_ERROR_CODES.IMAGE_NO_ALT_TEXT : RULEBOOK_ERROR_CODES.IMAGE_INVALID,
        severity: 'BLOCK',
        message: msg,
        field: 'imageBrief',
      });
    }
  }

  const claimsErr = checkImageNoNewClaims(brief, title, resolutionCriteria);
  if (claimsErr) errors.push(claimsErr);

  return errors;
}
