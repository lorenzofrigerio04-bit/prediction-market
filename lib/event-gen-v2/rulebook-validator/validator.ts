/**
 * Rulebook Validator v2 - Main validator
 * Runs v2 rules and returns structured result with BLOCK/WARN errors.
 */

import type { RulebookV2Input, RulebookV2Result } from './types';
import type { RulebookError } from './error-schema';
import { runRulebookV2Rules } from './rules';
import { checkImageCompliance } from './image-rules';

/**
 * Validates a market candidate against rulebook v2 rules.
 * - BLOCK errors: valid = false, candidate should be rejected
 * - WARN errors: valid = true, needsReview = true
 */
export function validateRulebookV2(
  input: RulebookV2Input,
  options?: { validateImage?: boolean }
): RulebookV2Result {
  const errors: RulebookError[] = [];

  // Run market rules
  const marketErrors = runRulebookV2Rules(input);
  errors.push(...marketErrors);

  // Run image rules when imageBrief is provided or when explicitly requested
  const shouldValidateImage = options?.validateImage ?? !!input.imageBrief;
  if (shouldValidateImage) {
    const resolutionCriteria = [
      input.resolutionCriteriaYes,
      input.resolutionCriteriaNo,
      input.resolutionCriteriaFull,
    ]
      .filter(Boolean)
      .join(' ');
    const imageErrors = checkImageCompliance(
      input.imageBrief ?? null,
      input.title,
      resolutionCriteria,
      { required: !!input.imageBrief }
    );
    errors.push(...imageErrors);
  }

  const blockErrors = errors.filter((e) => e.severity === 'BLOCK');
  const warnErrors = errors.filter((e) => e.severity === 'WARN');

  return {
    valid: blockErrors.length === 0,
    needsReview: warnErrors.length > 0,
    errors,
  };
}
