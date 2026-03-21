import { GovernanceModuleStatus } from "../enums/governance-module-status.enum.js";
export declare const GOVERNANCE_MODULE_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/governance-module.schema.json";
export declare const governanceModuleSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-module.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "status", "supported_operations", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: GovernanceModuleStatus[];
        };
        readonly supported_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
};
//# sourceMappingURL=governance-module.schema.d.ts.map