import type { CandidateDraftContract } from "./candidate-submission-adapter";

export interface MdeShadowValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Conservative, contract-level validation used to progressively bridge legacy
 * candidates toward Market Design Engine contracts without changing runtime
 * behavior by default.
 */
export function validateAgainstMdeContract(
  draft: CandidateDraftContract
): MdeShadowValidationResult {
  if (!draft.title || draft.title.trim().length < 10) {
    return { valid: false, reason: "MDE_SHADOW_TITLE_TOO_SHORT" };
  }

  if (!(draft.closesAt instanceof Date) || Number.isNaN(draft.closesAt.getTime())) {
    return { valid: false, reason: "MDE_SHADOW_INVALID_CLOSES_AT" };
  }

  if (!draft.category || draft.category.trim().length === 0) {
    return { valid: false, reason: "MDE_SHADOW_CATEGORY_REQUIRED" };
  }

  return { valid: true };
}
