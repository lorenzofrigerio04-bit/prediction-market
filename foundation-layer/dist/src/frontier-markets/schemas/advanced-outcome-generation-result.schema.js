import { FUTURE_CONTRACT_TYPES } from "../../market-design/enums/contract-type.enum.js";
import { OutcomeExclusivityPolicy } from "../../market-design/enums/outcome-exclusivity-policy.enum.js";
import { OutcomeExhaustivenessPolicy } from "../../market-design/enums/outcome-exhaustiveness-policy.enum.js";
export const ADVANCED_OUTCOME_GENERATION_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/advanced-outcome-generation-result.schema.json";
export const advancedOutcomeGenerationResultSchema = {
    $id: ADVANCED_OUTCOME_GENERATION_RESULT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "contract_type",
        "generated_outcomes",
        "validation_notes",
        "exhaustiveness_policy",
        "exclusivity_policy",
        "generation_confidence",
    ],
    properties: {
        id: { type: "string", pattern: "^fgr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        contract_type: { type: "string", enum: [...FUTURE_CONTRACT_TYPES] },
        generated_outcomes: {
            type: "array",
            minItems: 1,
            items: {
                $ref: "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json",
            },
        },
        validation_notes: {
            type: "array",
            items: { type: "string", minLength: 1 },
        },
        exhaustiveness_policy: { type: "string", enum: Object.values(OutcomeExhaustivenessPolicy) },
        exclusivity_policy: { type: "string", enum: Object.values(OutcomeExclusivityPolicy) },
        generation_confidence: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
    },
};
//# sourceMappingURL=advanced-outcome-generation-result.schema.js.map