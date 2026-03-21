import { CompatibilityStatus } from "../enums/compatibility-status.enum.js";
export declare const ADMIN_GOVERNANCE_COMPATIBILITY_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/admin-governance-compatibility-view.schema.json";
export declare const adminGovernanceCompatibilityViewSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/admin-governance-compatibility-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "requested_operations", "allowed_operations", "denied_operations", "lossy_fields", "status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly requested_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly allowed_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly lossy_fields: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly status: {
            readonly type: "string";
            readonly enum: CompatibilityStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
};
//# sourceMappingURL=admin-governance-compatibility-view.schema.d.ts.map