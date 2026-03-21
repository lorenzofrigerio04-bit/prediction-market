import { OutcomeExclusivityPolicy } from "../../../market-design/enums/outcome-exclusivity-policy.enum.js";
import { OutcomeExhaustivenessPolicy } from "../../../market-design/enums/outcome-exhaustiveness-policy.enum.js";
import type { AdvancedOutcomeGenerator, AdvancedOutcomeGeneratorInput } from "../interfaces/advanced-outcome-generator.js";
export declare class DeterministicAdvancedOutcomeGenerator implements AdvancedOutcomeGenerator {
    generate(input: AdvancedOutcomeGeneratorInput): Readonly<{
        id: import("../../index.js").AdvancedOutcomeGenerationResultId;
        contract_type: import("../../../index.js").FutureContractType;
        generated_outcomes: readonly import("../../../index.js").OutcomeDefinition[];
        validation_notes: readonly import("../../index.js").ValidationNote[];
        exhaustiveness_policy: OutcomeExhaustivenessPolicy;
        exclusivity_policy: OutcomeExclusivityPolicy;
        generation_confidence: import("../../index.js").GenerationConfidence;
    }>;
}
//# sourceMappingURL=deterministic-advanced-outcome-generator.d.ts.map