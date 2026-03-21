import { CompatibilityStatus } from "../enums/compatibility-status.enum.js";
export const ADMIN_GOVERNANCE_COMPATIBILITY_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/admin-governance-compatibility-view.schema.json";
export const adminGovernanceCompatibilityViewSchema = {
    $id: ADMIN_GOVERNANCE_COMPATIBILITY_VIEW_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "module_key",
        "requested_operations",
        "allowed_operations",
        "denied_operations",
        "lossy_fields",
        "status",
        "metadata",
    ],
    properties: {
        id: { type: "string", pattern: "^agc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        module_key: { type: "string", minLength: 1 },
        requested_operations: { type: "array", items: { type: "string", minLength: 1 } },
        allowed_operations: { type: "array", items: { type: "string", minLength: 1 } },
        denied_operations: { type: "array", items: { type: "string", minLength: 1 } },
        lossy_fields: { type: "array", items: { type: "string", minLength: 1 } },
        status: { type: "string", enum: Object.values(CompatibilityStatus) },
        metadata: { type: "object", additionalProperties: { type: "string" } },
    },
};
//# sourceMappingURL=admin-governance-compatibility-view.schema.js.map