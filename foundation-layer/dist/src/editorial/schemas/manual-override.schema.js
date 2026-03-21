import { OverrideType } from "../enums/override-type.enum.js";
export const MANUAL_OVERRIDE_SCHEMA_ID = "https://market-design-engine.dev/schemas/editorial/manual-override.schema.json";
export const manualOverrideSchema = {
    $id: MANUAL_OVERRIDE_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "target_entity_type",
        "target_entity_id",
        "override_type",
        "initiated_by",
        "initiated_at",
        "override_reason",
        "override_scope",
        "expiration_nullable",
        "audit_reference_id",
    ],
    properties: {
        id: { type: "string", pattern: "^ovr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        target_entity_type: { type: "string", minLength: 1 },
        target_entity_id: { type: "string", minLength: 1 },
        override_type: { type: "string", enum: Object.values(OverrideType) },
        initiated_by: { type: "string", pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        initiated_at: { type: "string", format: "date-time" },
        override_reason: { type: "string", minLength: 1 },
        override_scope: {
            type: "object",
            additionalProperties: false,
            required: ["affected_fields", "allow_readiness_gate_bypass"],
            properties: {
                affected_fields: {
                    type: "array",
                    minItems: 1,
                    items: { type: "string", minLength: 1 },
                },
                allow_readiness_gate_bypass: { type: "boolean" },
            },
        },
        expiration_nullable: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
        audit_reference_id: { type: "string", pattern: "^aref_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    },
};
//# sourceMappingURL=manual-override.schema.js.map