import { DeadlineBasisType } from "../enums/deadline-basis-type.enum.js";
export const DEADLINE_RESOLUTION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
export const deadlineResolutionSchema = {
    $id: DEADLINE_RESOLUTION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "canonical_event_id",
        "event_deadline",
        "market_close_time",
        "resolution_cutoff_nullable",
        "timezone",
        "deadline_basis_type",
        "deadline_basis_reference",
        "confidence",
        "warnings",
    ],
    properties: {
        id: { type: "string", pattern: "^dlr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        canonical_event_id: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId",
        },
        event_deadline: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
        market_close_time: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
        resolution_cutoff_nullable: {
            oneOf: [
                { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
                { type: "null" },
            ],
        },
        timezone: { type: "string", minLength: 1 },
        deadline_basis_type: { type: "string", enum: Object.values(DeadlineBasisType) },
        deadline_basis_reference: { type: "string", minLength: 1 },
        confidence: { $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01" },
        warnings: { type: "array", items: { type: "string" } },
    },
};
//# sourceMappingURL=deadline-resolution.schema.js.map