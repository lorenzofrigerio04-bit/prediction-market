import { CandidateOutcomeType } from "../../enums/candidate-outcome-type.enum.js";
export const MARKET_OUTCOME_SCHEMA_ID = "https://market-design-engine.dev/schemas/entities/market-outcome.schema.json";
export const marketOutcomeSchema = {
    $id: MARKET_OUTCOME_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "outcomeType",
        "label",
        "shortLabel",
        "description",
        "orderIndex",
        "probabilityHint",
        "entityVersion",
    ],
    properties: {
        id: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/outcomeId",
        },
        outcomeType: { type: "string", enum: Object.values(CandidateOutcomeType) },
        label: { type: "string", minLength: 1 },
        shortLabel: { type: ["string", "null"] },
        description: { type: ["string", "null"] },
        orderIndex: { type: "integer", minimum: 0 },
        probabilityHint: {
            oneOf: [
                { $ref: "https://market-design-engine.dev/schemas/value-objects/probability.schema.json" },
                { type: "null" },
            ],
        },
        entityVersion: { type: "integer", minimum: 1 },
    },
};
//# sourceMappingURL=market-outcome.schema.js.map