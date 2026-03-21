import { ContractType } from "../../enums/contract-type.enum.js";
import { OutcomeExclusivityPolicy } from "../../enums/outcome-exclusivity-policy.enum.js";
import { OutcomeExhaustivenessPolicy } from "../../enums/outcome-exhaustiveness-policy.enum.js";
import type { OutcomeGenerationResultId } from "../../value-objects/market-design-ids.vo.js";
import { type OutcomeDefinition } from "./outcome-definition.entity.js";
export type OutcomeGenerationResult = Readonly<{
    id: OutcomeGenerationResultId;
    contract_type: ContractType;
    outcomes: readonly OutcomeDefinition[];
    exhaustiveness_policy: OutcomeExhaustivenessPolicy;
    exclusivity_policy: OutcomeExclusivityPolicy;
    generation_confidence: number;
    validation_notes: readonly string[];
}>;
export declare const createOutcomeGenerationResult: (input: OutcomeGenerationResult) => OutcomeGenerationResult;
//# sourceMappingURL=outcome-generation-result.entity.d.ts.map