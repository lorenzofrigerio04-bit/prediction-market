import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { FamilyCompatibilityStatus } from "../../enums/family-compatibility-status.enum.js";
import type { MarketFamilyCompatibilityResultId } from "../../value-objects/market-expansion-ids.vo.js";
import { createExpansionNote, type ExpansionNote } from "../../value-objects/market-expansion-shared.vo.js";

export type FamilyCompatibilityTarget =
  | "market_draft_pipeline"
  | "publishable_candidate"
  | "publication_ready_artifact"
  | "editorial_pipeline";

export type MarketFamilyCompatibilityResult = Readonly<{
  id: MarketFamilyCompatibilityResultId;
  target: FamilyCompatibilityTarget;
  status: FamilyCompatibilityStatus;
  mapped_artifact: Readonly<Record<string, unknown>>;
  notes: readonly ExpansionNote[];
}>;

export const createMarketFamilyCompatibilityResult = (
  input: MarketFamilyCompatibilityResult,
): MarketFamilyCompatibilityResult => {
  if (!Object.values(FamilyCompatibilityStatus).includes(input.status)) {
    throw new ValidationError("INVALID_MARKET_FAMILY_COMPATIBILITY_RESULT", "status is invalid");
  }
  return deepFreeze({
    ...input,
    mapped_artifact: deepFreeze({ ...input.mapped_artifact }),
    notes: input.notes.map(createExpansionNote),
  });
};
