/**
 * Main validator: applies hard-fail and needs-review rules, returns ValidationResult.
 */

import type { MarketValidationInput, ValidationResult } from "./types";
import {
  runHardFailRules,
  runNeedsReviewRules,
  DEFAULT_VALIDATOR_CONFIG,
  type ValidatorRulesConfig,
} from "./rules";

/**
 * Validates a market creation payload.
 * - Hard fail: any hard-fail rule triggers → valid: false, reasons include the failure.
 * - Needs review: if no hard fail, needs-review rules are run → needsReview: true if any flag, reasons appended.
 *
 * @param input - Market candidate (title, description, closesAt, resolutionSourceUrl, resolutionNotes)
 * @param config - Optional rules config (domain lists, time bounds)
 * @returns { valid, needsReview, reasons }
 */
export function validateMarket(
  input: MarketValidationInput,
  config?: Partial<ValidatorRulesConfig>
): ValidationResult {
  const cfg: ValidatorRulesConfig = { ...DEFAULT_VALIDATOR_CONFIG, ...config };
  const reasons: string[] = [];

  const hardFailReasons = runHardFailRules(input, cfg);
  if (hardFailReasons.length > 0) {
    return {
      valid: false,
      needsReview: false,
      reasons: hardFailReasons,
    };
  }

  const needsReviewReasons = runNeedsReviewRules(input);
  return {
    valid: true,
    needsReview: needsReviewReasons.length > 0,
    reasons: needsReviewReasons,
  };
}
