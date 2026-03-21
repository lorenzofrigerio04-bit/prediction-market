import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { CannibalizationStatus } from "../../enums/cannibalization-status.enum.js";
import type {
  CannibalizationCheckResultId,
  MarketFamilyId,
} from "../../value-objects/market-expansion-ids.vo.js";
import { createExpansionNote, type ExpansionNote } from "../../value-objects/market-expansion-shared.vo.js";

export type CheckedMarketPair = Readonly<{
  source_market_ref: string;
  target_market_ref: string;
}>;

export type CannibalizationCheckResult = Readonly<{
  id: CannibalizationCheckResultId;
  family_id: MarketFamilyId;
  checked_market_pairs: readonly CheckedMarketPair[];
  blocking_conflicts: readonly ExpansionNote[];
  warnings: readonly ExpansionNote[];
  check_status: CannibalizationStatus;
}>;

export const createCannibalizationCheckResult = (
  input: CannibalizationCheckResult,
): CannibalizationCheckResult => {
  if (!Object.values(CannibalizationStatus).includes(input.check_status)) {
    throw new ValidationError("INVALID_CANNIBALIZATION_CHECK_RESULT", "check_status is invalid");
  }
  if (
    input.check_status === CannibalizationStatus.BLOCKING &&
    input.blocking_conflicts.length === 0
  ) {
    throw new ValidationError(
      "INVALID_CANNIBALIZATION_CHECK_RESULT",
      "blocking check status requires at least one blocking conflict",
    );
  }
  return deepFreeze({
    ...input,
    checked_market_pairs: deepFreeze(
      input.checked_market_pairs.map((pair) =>
        deepFreeze({
          source_market_ref: pair.source_market_ref,
          target_market_ref: pair.target_market_ref,
        }),
      ),
    ),
    blocking_conflicts: input.blocking_conflicts.map(createExpansionNote),
    warnings: input.warnings.map(createExpansionNote),
  });
};
