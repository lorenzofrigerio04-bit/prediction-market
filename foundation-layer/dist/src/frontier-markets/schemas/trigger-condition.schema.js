import { TriggerType } from "../enums/trigger-type.enum.js";
export const TRIGGER_CONDITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/trigger-condition.schema.json";
export const triggerConditionSchema = {
    $id: TRIGGER_CONDITION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "trigger_type",
        "upstream_event_ref_or_market_ref",
        "triggering_outcome",
        "trigger_deadline_nullable",
        "trigger_policy_notes",
    ],
    properties: {
        trigger_type: { type: "string", enum: Object.values(TriggerType) },
        upstream_event_ref_or_market_ref: {
            oneOf: [
                {
                    type: "object",
                    additionalProperties: false,
                    required: ["kind", "event_id"],
                    properties: {
                        kind: { const: "upstream_event" },
                        event_id: { type: "string", pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
                    },
                },
                {
                    type: "object",
                    additionalProperties: false,
                    required: ["kind", "market_id"],
                    properties: {
                        kind: { const: "upstream_market" },
                        market_id: { type: "string", minLength: 1 },
                    },
                },
            ],
        },
        triggering_outcome: { type: "string", minLength: 1 },
        trigger_deadline_nullable: {
            anyOf: [{ type: "null" }, { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" }],
        },
        trigger_policy_notes: {
            type: "array",
            items: { type: "string", minLength: 1 },
        },
    },
};
//# sourceMappingURL=trigger-condition.schema.js.map