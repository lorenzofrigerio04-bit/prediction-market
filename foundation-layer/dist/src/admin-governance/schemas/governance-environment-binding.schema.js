import { EnvironmentTier } from "../enums/environment-tier.enum.js";
import { GovernanceEnvironmentStatus } from "../enums/governance-environment-status.enum.js";
export const GOVERNANCE_ENVIRONMENT_BINDING_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/governance-environment-binding.schema.json";
export const governanceEnvironmentBindingSchema = {
    $id: GOVERNANCE_ENVIRONMENT_BINDING_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["id", "version", "module_id", "environment_key", "environment_tier", "status", "metadata"],
    properties: {
        id: { type: "string", pattern: "^agev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        module_id: { type: "string", pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        environment_key: { type: "string", minLength: 1 },
        environment_tier: { type: "string", enum: Object.values(EnvironmentTier) },
        status: { type: "string", enum: Object.values(GovernanceEnvironmentStatus) },
        metadata: { type: "object", additionalProperties: { type: "string" } },
    },
};
//# sourceMappingURL=governance-environment-binding.schema.js.map