import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { FUTURE_CONTRACT_TYPES, } from "../../../market-design/enums/contract-type.enum.js";
import { createOutcomeDefinition } from "../../../market-design/outcomes/entities/outcome-definition.entity.js";
import { createGenerationConfidence, } from "../../value-objects/generation-confidence.vo.js";
import { createValidationNote, } from "../../value-objects/frontier-text.vo.js";
export const createAdvancedOutcomeGenerationResult = (input) => {
    const futureContractTypes = new Set(FUTURE_CONTRACT_TYPES);
    if (!futureContractTypes.has(input.contract_type)) {
        throw new ValidationError("INVALID_ADVANCED_OUTCOME_GENERATION", "contract_type must be a frontier advanced contract type");
    }
    if (input.generated_outcomes.length === 0) {
        throw new ValidationError("INVALID_ADVANCED_OUTCOME_GENERATION", "generated_outcomes must not be empty");
    }
    const normalizedOutcomes = input.generated_outcomes.map(createOutcomeDefinition);
    return deepFreeze({
        ...input,
        generated_outcomes: normalizedOutcomes,
        validation_notes: input.validation_notes.map(createValidationNote),
        generation_confidence: createGenerationConfidence(input.generation_confidence),
    });
};
//# sourceMappingURL=advanced-outcome-generation-result.entity.js.map