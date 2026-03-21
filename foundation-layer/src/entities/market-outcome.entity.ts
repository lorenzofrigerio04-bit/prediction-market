import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";
import { CandidateOutcomeType } from "../enums/candidate-outcome-type.enum.js";
import type { EntityVersion } from "../value-objects/entity-version.vo.js";
import type { OutcomeId } from "../value-objects/outcome-id.vo.js";
import type { Probability } from "../value-objects/probability.vo.js";

export type MarketOutcome = Readonly<{
  id: OutcomeId;
  outcomeType: CandidateOutcomeType;
  label: string;
  shortLabel: string | null;
  description: string | null;
  orderIndex: number;
  probabilityHint: Probability | null;
  entityVersion: EntityVersion;
}>;

export const createMarketOutcome = (input: MarketOutcome): MarketOutcome => {
  if (!Object.values(CandidateOutcomeType).includes(input.outcomeType)) {
    throw new ValidationError("INVALID_OUTCOME_TYPE", "outcomeType is invalid");
  }
  if (input.label.trim().length === 0) {
    throw new ValidationError("INVALID_OUTCOME_LABEL", "label must be non-empty");
  }
  if (!Number.isInteger(input.orderIndex) || input.orderIndex < 0) {
    throw new ValidationError(
      "INVALID_OUTCOME_ORDER_INDEX",
      "orderIndex must be an integer >= 0",
      { value: input.orderIndex },
    );
  }
  return deepFreeze({
    ...input,
    label: input.label.trim(),
    shortLabel: input.shortLabel?.trim() ?? null,
    description: input.description?.trim() ?? null,
  });
};
