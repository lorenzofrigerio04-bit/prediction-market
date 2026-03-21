import { EmergencyState } from "../enums/emergency-state.enum.js";
export const EMERGENCY_CONTROL_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/emergency-control.schema.json";
export const emergencyControlSchema = {
    $id: EMERGENCY_CONTROL_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "module_key",
        "state",
        "reason",
        "activated_by",
        "activated_at",
        "expires_at_nullable",
        "metadata",
    ],
    properties: {
        id: { type: "string", pattern: "^age_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        module_key: { type: "string", minLength: 1 },
        state: { type: "string", enum: Object.values(EmergencyState) },
        reason: { type: "string", minLength: 1 },
        activated_by: { type: "string", minLength: 1 },
        activated_at: { type: "string", format: "date-time" },
        expires_at_nullable: { anyOf: [{ type: "null" }, { type: "string", format: "date-time" }] },
        metadata: { type: "object", additionalProperties: { type: "string" } },
    },
};
//# sourceMappingURL=emergency-control.schema.js.map