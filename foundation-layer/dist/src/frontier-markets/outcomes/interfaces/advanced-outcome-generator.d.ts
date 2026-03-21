import type { FutureContractType } from "../../../market-design/enums/contract-type.enum.js";
import type { OutcomeDefinition } from "../../../market-design/outcomes/entities/outcome-definition.entity.js";
import type { AdvancedOutcomeGenerationResult } from "../entities/advanced-outcome-generation-result.entity.js";
export type AdvancedOutcomeGeneratorInput = Readonly<{
    id: string;
    contract_type: FutureContractType;
    outcomes: readonly OutcomeDefinition[];
    validation_notes?: readonly string[];
    generation_confidence: number;
}>;
export interface AdvancedOutcomeGenerator {
    generate(input: AdvancedOutcomeGeneratorInput): AdvancedOutcomeGenerationResult;
}
//# sourceMappingURL=advanced-outcome-generator.d.ts.map