import { EnvironmentTier } from "../enums/environment-tier.enum.js";
import { GovernanceEnvironmentStatus } from "../enums/governance-environment-status.enum.js";
export declare const GOVERNANCE_ENVIRONMENT_BINDING_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/governance-environment-binding.schema.json";
export declare const governanceEnvironmentBindingSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-environment-binding.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_id", "environment_key", "environment_tier", "status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_id: {
            readonly type: "string";
            readonly pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly environment_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly environment_tier: {
            readonly type: "string";
            readonly enum: EnvironmentTier[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: GovernanceEnvironmentStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
};
//# sourceMappingURL=governance-environment-binding.schema.d.ts.map