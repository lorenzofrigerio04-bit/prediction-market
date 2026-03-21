import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { OutcomeId } from "../../../value-objects/outcome-id.vo.js";
import type { RangeDefinition } from "../../value-objects/range-definition.vo.js";
import { createRangeDefinition } from "../../value-objects/range-definition.vo.js";
import { createOutcomeKey, type OutcomeKey } from "../../value-objects/outcome-key.vo.js";

export type OutcomeDefinition = Readonly<{
  id: OutcomeId;
  outcome_key: OutcomeKey;
  display_label: string;
  semantic_definition: string;
  ordering_index_nullable: number | null;
  range_definition_nullable: RangeDefinition | null;
  active: boolean;
}>;

export const createOutcomeDefinition = (input: OutcomeDefinition): OutcomeDefinition => {
  createOutcomeKey(input.outcome_key);
  if (input.display_label.trim().length === 0) {
    throw new ValidationError("INVALID_OUTCOME_DEFINITION", "display_label must be non-empty");
  }
  if (input.semantic_definition.trim().length === 0) {
    throw new ValidationError("INVALID_OUTCOME_DEFINITION", "semantic_definition must be non-empty");
  }
  if (input.ordering_index_nullable !== null) {
    if (!Number.isInteger(input.ordering_index_nullable) || input.ordering_index_nullable < 0) {
      throw new ValidationError(
        "INVALID_OUTCOME_DEFINITION",
        "ordering_index_nullable must be an integer >= 0 when provided",
      );
    }
  }
  if (input.range_definition_nullable !== null) {
    createRangeDefinition(input.range_definition_nullable);
  }
  return deepFreeze({
    ...input,
    display_label: input.display_label.trim(),
    semantic_definition: input.semantic_definition.trim(),
    range_definition_nullable:
      input.range_definition_nullable === null ? null : createRangeDefinition(input.range_definition_nullable),
  });
};
