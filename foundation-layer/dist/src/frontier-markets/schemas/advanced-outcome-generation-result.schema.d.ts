import { OutcomeExclusivityPolicy } from "../../market-design/enums/outcome-exclusivity-policy.enum.js";
import { OutcomeExhaustivenessPolicy } from "../../market-design/enums/outcome-exhaustiveness-policy.enum.js";
export declare const ADVANCED_OUTCOME_GENERATION_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/advanced-outcome-generation-result.schema.json";
export declare const advancedOutcomeGenerationResultSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/advanced-outcome-generation-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "contract_type", "generated_outcomes", "validation_notes", "exhaustiveness_policy", "exclusivity_policy", "generation_confidence"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fgr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly contract_type: {
            readonly type: "string";
            readonly enum: readonly [import("../../index.js").ContractType.RACE, import("../../index.js").ContractType.SEQUENCE, import("../../index.js").ContractType.CONDITIONAL];
        };
        readonly generated_outcomes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json";
            };
        };
        readonly validation_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly exhaustiveness_policy: {
            readonly type: "string";
            readonly enum: OutcomeExhaustivenessPolicy[];
        };
        readonly exclusivity_policy: {
            readonly type: "string";
            readonly enum: OutcomeExclusivityPolicy[];
        };
        readonly generation_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
};
//# sourceMappingURL=advanced-outcome-generation-result.schema.d.ts.map