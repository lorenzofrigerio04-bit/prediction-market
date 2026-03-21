import { ContractType } from "../enums/contract-type.enum.js";
import { OutcomeExclusivityPolicy } from "../enums/outcome-exclusivity-policy.enum.js";
import { OutcomeExhaustivenessPolicy } from "../enums/outcome-exhaustiveness-policy.enum.js";
export declare const OUTCOME_GENERATION_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/outcome-generation-result.schema.json";
export declare const outcomeGenerationResultSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/outcome-generation-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "contract_type", "outcomes", "exhaustiveness_policy", "exclusivity_policy", "generation_confidence", "validation_notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ogr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly contract_type: {
            readonly type: "string";
            readonly enum: ContractType[];
        };
        readonly outcomes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json";
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
        readonly validation_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
//# sourceMappingURL=outcome-generation-result.schema.d.ts.map