import { FeatureFlagDefaultState } from "../enums/feature-flag-default-state.enum.js";
import { SafetyControlLevel } from "../enums/safety-control-level.enum.js";
export declare const ADMIN_FEATURE_FLAG_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/admin-feature-flag.schema.json";
export declare const adminFeatureFlagSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/admin-feature-flag.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "flag_key", "module_id", "source_id_nullable", "default_state", "enabled", "safety_level", "owner_ref", "audit_ref", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly flag_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly module_id: {
            readonly type: "string";
            readonly pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly source_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^ags_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly default_state: {
            readonly type: "string";
            readonly enum: FeatureFlagDefaultState[];
        };
        readonly enabled: {
            readonly type: "boolean";
        };
        readonly safety_level: {
            readonly type: "string";
            readonly enum: SafetyControlLevel[];
        };
        readonly owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
};
//# sourceMappingURL=admin-feature-flag.schema.d.ts.map