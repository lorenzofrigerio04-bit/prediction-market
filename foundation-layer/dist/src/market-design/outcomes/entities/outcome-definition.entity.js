import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createRangeDefinition } from "../../value-objects/range-definition.vo.js";
import { createOutcomeKey } from "../../value-objects/outcome-key.vo.js";
export const createOutcomeDefinition = (input) => {
    createOutcomeKey(input.outcome_key);
    if (input.display_label.trim().length === 0) {
        throw new ValidationError("INVALID_OUTCOME_DEFINITION", "display_label must be non-empty");
    }
    if (input.semantic_definition.trim().length === 0) {
        throw new ValidationError("INVALID_OUTCOME_DEFINITION", "semantic_definition must be non-empty");
    }
    if (input.ordering_index_nullable !== null) {
        if (!Number.isInteger(input.ordering_index_nullable) || input.ordering_index_nullable < 0) {
            throw new ValidationError("INVALID_OUTCOME_DEFINITION", "ordering_index_nullable must be an integer >= 0 when provided");
        }
    }
    if (input.range_definition_nullable !== null) {
        createRangeDefinition(input.range_definition_nullable);
    }
    return deepFreeze({
        ...input,
        display_label: input.display_label.trim(),
        semantic_definition: input.semantic_definition.trim(),
        range_definition_nullable: input.range_definition_nullable === null ? null : createRangeDefinition(input.range_definition_nullable),
    });
};
//# sourceMappingURL=outcome-definition.entity.js.map