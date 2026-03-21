import { type FutureContractType } from "../../../market-design/enums/contract-type.enum.js";
import type { OutcomeExclusivityPolicy } from "../../../market-design/enums/outcome-exclusivity-policy.enum.js";
import type { OutcomeExhaustivenessPolicy } from "../../../market-design/enums/outcome-exhaustiveness-policy.enum.js";
import { type OutcomeDefinition } from "../../../market-design/outcomes/entities/outcome-definition.entity.js";
import { type GenerationConfidence } from "../../value-objects/generation-confidence.vo.js";
import type { AdvancedOutcomeGenerationResultId } from "../../value-objects/frontier-market-ids.vo.js";
import { type ValidationNote } from "../../value-objects/frontier-text.vo.js";
export type AdvancedOutcomeGenerationResult = Readonly<{
    id: AdvancedOutcomeGenerationResultId;
    contract_type: FutureContractType;
    generated_outcomes: readonly OutcomeDefinition[];
    validation_notes: readonly ValidationNote[];
    exhaustiveness_policy: OutcomeExhaustivenessPolicy;
    exclusivity_policy: OutcomeExclusivityPolicy;
    generation_confidence: GenerationConfidence;
}>;
export declare const createAdvancedOutcomeGenerationResult: (input: AdvancedOutcomeGenerationResult) => AdvancedOutcomeGenerationResult;
//# sourceMappingURL=advanced-outcome-generation-result.entity.d.ts.map