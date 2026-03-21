import { OutcomeExclusivityPolicy } from "../../../market-design/enums/outcome-exclusivity-policy.enum.js";
import { OutcomeExhaustivenessPolicy } from "../../../market-design/enums/outcome-exhaustiveness-policy.enum.js";
import { createAdvancedOutcomeGenerationResult } from "../entities/advanced-outcome-generation-result.entity.js";
import { createAdvancedOutcomeGenerationResultId } from "../../value-objects/frontier-market-ids.vo.js";
import { createValidationNote } from "../../value-objects/frontier-text.vo.js";
export class DeterministicAdvancedOutcomeGenerator {
    generate(input) {
        return createAdvancedOutcomeGenerationResult({
            id: createAdvancedOutcomeGenerationResultId(input.id),
            contract_type: input.contract_type,
            generated_outcomes: [...input.outcomes],
            validation_notes: (input.validation_notes ?? []).map(createValidationNote),
            exhaustiveness_policy: OutcomeExhaustivenessPolicy.EXHAUSTIVE,
            exclusivity_policy: OutcomeExclusivityPolicy.MUTUALLY_EXCLUSIVE,
            generation_confidence: input.generation_confidence,
        });
    }
}
//# sourceMappingURL=deterministic-advanced-outcome-generator.js.map