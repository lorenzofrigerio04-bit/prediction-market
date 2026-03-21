import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { AdvancedCompatibilityStatus } from "../../enums/advanced-compatibility-status.enum.js";
import type { AdvancedMarketCompatibilityResultId } from "../../value-objects/frontier-market-ids.vo.js";
import { createCompatibilityNote, type CompatibilityNote } from "../../value-objects/frontier-text.vo.js";

export type CompatibilityTarget = "market_draft_pipeline" | "publishing_engine" | "editorial_pipeline";

export type AdvancedMarketCompatibilityResult = Readonly<{
  id: AdvancedMarketCompatibilityResultId;
  target: CompatibilityTarget;
  status: AdvancedCompatibilityStatus;
  mapped_artifact: Readonly<Record<string, unknown>>;
  notes: readonly CompatibilityNote[];
}>;

export const createAdvancedMarketCompatibilityResult = (
  input: AdvancedMarketCompatibilityResult,
): AdvancedMarketCompatibilityResult => {
  if (!Object.values(AdvancedCompatibilityStatus).includes(input.status)) {
    throw new ValidationError("INVALID_ADVANCED_COMPATIBILITY_RESULT", "status is invalid");
  }
  return deepFreeze({
    ...input,
    mapped_artifact: { ...input.mapped_artifact },
    notes: input.notes.map(createCompatibilityNote),
  });
};
