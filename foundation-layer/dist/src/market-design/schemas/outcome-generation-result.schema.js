import { ContractType } from "../enums/contract-type.enum.js";
import { OutcomeExclusivityPolicy } from "../enums/outcome-exclusivity-policy.enum.js";
import { OutcomeExhaustivenessPolicy } from "../enums/outcome-exhaustiveness-policy.enum.js";
export const OUTCOME_GENERATION_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/outcome-generation-result.schema.json";
export const outcomeGenerationResultSchema = {
    $id: OUTCOME_GENERATION_RESULT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "contract_type",
        "outcomes",
        "exhaustiveness_policy",
        "exclusivity_policy",
        "generation_confidence",
        "validation_notes",
    ],
    properties: {
        id: { type: "string", pattern: "^ogr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        contract_type: { type: "string", enum: Object.values(ContractType) },
        outcomes: {
            type: "array",
            minItems: 1,
            items: {
                $ref: "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json",
            },
        },
        exhaustiveness_policy: { type: "string", enum: Object.values(OutcomeExhaustivenessPolicy) },
        exclusivity_policy: { type: "string", enum: Object.values(OutcomeExclusivityPolicy) },
        generation_confidence: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
        validation_notes: {
            type: "array",
            items: { type: "string" },
        },
    },
};
//# sourceMappingURL=outcome-generation-result.schema.js.map