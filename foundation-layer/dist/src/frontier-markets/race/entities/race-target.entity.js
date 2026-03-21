import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createDisplayLabel, createSemanticDefinition, } from "../../value-objects/frontier-text.vo.js";
import { createRaceTargetKey } from "../../value-objects/race-target-key.vo.js";
export const createRaceTarget = (input) => {
    createRaceTargetKey(input.target_key);
    createDisplayLabel(input.display_label);
    createSemanticDefinition(input.semantic_definition);
    if (input.ordering_priority_nullable !== null) {
        if (!Number.isInteger(input.ordering_priority_nullable) || input.ordering_priority_nullable <= 0) {
            throw new ValidationError("INVALID_RACE_TARGET", "ordering_priority_nullable must be an integer > 0 when provided");
        }
    }
    return deepFreeze({
        ...input,
        display_label: input.display_label.trim(),
        semantic_definition: input.semantic_definition.trim(),
    });
};
//# sourceMappingURL=race-target.entity.js.map