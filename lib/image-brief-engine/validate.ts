/**
 * Image Brief Engine - Validation rules
 *
 * Validates ImageBrief structure and content before use.
 */

import type { ImageBrief } from '../event-gen-v2/types';
import type { ValidationResult } from './types';
import { isStylePresetId } from './presets';

const ALT_TEXT_MIN = 90;
const ALT_TEXT_MAX = 140;
const MAX_SUBJECT_ENTITIES = 5;

const REQUIRED_NEGATIVE_TERMS = ['text', 'logos', 'watermarks'];

/**
 * Validate an ImageBrief. Returns validation result with errors.
 */
export function validateImageBrief(brief: ImageBrief): ValidationResult {
  const errors: string[] = [];

  if (!brief.subject_entities || !Array.isArray(brief.subject_entities)) {
    errors.push('subject_entities must be a non-empty array');
  } else {
    if (brief.subject_entities.length === 0) {
      errors.push('subject_entities must not be empty');
    }
    if (brief.subject_entities.length > MAX_SUBJECT_ENTITIES) {
      errors.push(`subject_entities must have at most ${MAX_SUBJECT_ENTITIES} items`);
    }
  }

  if (!brief.alt_text || typeof brief.alt_text !== 'string') {
    errors.push('alt_text is required');
  } else {
    const len = brief.alt_text.length;
    if (len < ALT_TEXT_MIN) {
      errors.push(`alt_text must be at least ${ALT_TEXT_MIN} characters (got ${len})`);
    }
    if (len > ALT_TEXT_MAX) {
      errors.push(`alt_text must be at most ${ALT_TEXT_MAX} characters (got ${len})`);
    }
  }

  if (!brief.final_prompt || typeof brief.final_prompt !== 'string') {
    errors.push('final_prompt is required');
  } else {
    const lower = brief.final_prompt.toLowerCase();
    if (!lower.includes('no text') && !lower.includes('no text,')) {
      errors.push('final_prompt should explicitly exclude text (e.g. "no text")');
    }
  }

  const negPrompt = (brief.negative_prompt || '').toLowerCase();
  for (const term of REQUIRED_NEGATIVE_TERMS) {
    if (!negPrompt.includes(term)) {
      errors.push(`negative_prompt must include "${term}"`);
    }
  }

  if (!isStylePresetId(brief.style_preset)) {
    errors.push(
      `style_preset must be one of: editorial_photo, cinematic_noir, sports_action, market_chart_abstract, political_symbolic, minimal_iconic (got "${brief.style_preset}")`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if ImageBrief is valid.
 */
export function isValidImageBrief(brief: ImageBrief): boolean {
  return validateImageBrief(brief).valid;
}
