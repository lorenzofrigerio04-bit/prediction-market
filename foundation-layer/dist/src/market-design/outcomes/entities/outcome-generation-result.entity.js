import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ContractType } from "../../enums/contract-type.enum.js";
import { createScore01 } from "../../value-objects/score.vo.js";
import { createOutcomeDefinition } from "./outcome-definition.entity.js";
const hasOverlaps = (outcomes) => {
    const ranges = outcomes
        .map((outcome) => outcome.range_definition_nullable)
        .filter((range) => range !== null)
        .sort((left, right) => left.min_inclusive - right.min_inclusive);
    for (let index = 1; index < ranges.length; index += 1) {
        const previous = ranges[index - 1];
        const current = ranges[index];
        if (current.min_inclusive < previous.max_exclusive) {
            return true;
        }
    }
    return false;
};
export const createOutcomeGenerationResult = (input) => {
    createScore01(input.generation_confidence, "generation_confidence");
    if (input.outcomes.length === 0) {
        throw new ValidationError("INVALID_OUTCOME_GENERATION", "outcomes must not be empty");
    }
    const outcomes = input.outcomes.map(createOutcomeDefinition);
    const keySet = new Set(outcomes.map((outcome) => outcome.outcome_key));
    if (keySet.size !== outcomes.length) {
        throw new ValidationError("INVALID_OUTCOME_GENERATION", "outcome_key values must be unique");
    }
    if (input.contract_type === ContractType.BINARY && outcomes.length !== 2) {
        throw new ValidationError("INVALID_OUTCOME_GENERATION", "binary contract_type requires exactly 2 outcomes");
    }
    if (input.contract_type === ContractType.MULTI_OUTCOME && outcomes.length < 2) {
        throw new ValidationError("INVALID_OUTCOME_GENERATION", "multi_outcome contract_type requires at least 2 outcomes");
    }
    if (input.contract_type === ContractType.SCALAR_BRACKET) {
        if (outcomes.some((outcome) => outcome.range_definition_nullable === null)) {
            throw new ValidationError("INVALID_OUTCOME_GENERATION", "scalar_bracket outcomes require range_definition_nullable");
        }
        if (hasOverlaps(outcomes)) {
            throw new ValidationError("INVALID_OUTCOME_GENERATION", "scalar_bracket ranges must not overlap");
        }
    }
    return deepFreeze({
        ...input,
        outcomes,
        validation_notes: [...input.validation_notes],
    });
};
//# sourceMappingURL=outcome-generation-result.entity.js.map