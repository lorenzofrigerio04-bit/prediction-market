import { GuardrailSeverity } from "../enums/guardrail-severity.enum.js";
export declare const GUARDRAIL_POLICY_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/guardrail-policy.schema.json";
export declare const guardrailPolicySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/guardrail-policy.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "operation_key", "severity", "deny_by_default", "active", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly operation_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: GuardrailSeverity[];
        };
        readonly deny_by_default: {
            readonly type: "boolean";
        };
        readonly active: {
            readonly type: "boolean";
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
};
//# sourceMappingURL=guardrail-policy.schema.d.ts.map