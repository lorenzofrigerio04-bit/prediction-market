import { AccountOwnerScope } from "../enums/account-owner-scope.enum.js";
import { EnforcementMode } from "../enums/enforcement-mode.enum.js";
import { MeasurementWindowUnit } from "../enums/measurement-window-unit.enum.js";
import { QuotaType } from "../enums/quota-type.enum.js";
export declare const QUOTA_POLICY_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/quota-policy.schema.json";
export declare const quotaPolicySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/quota-policy.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "policy_key", "target_scope", "quota_type", "max_amount", "window_definition", "enforcement_mode", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vqp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly policy_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_scope: {
            readonly type: "string";
            readonly enum: AccountOwnerScope[];
        };
        readonly quota_type: {
            readonly type: "string";
            readonly enum: QuotaType[];
        };
        readonly max_amount: {
            readonly type: "number";
        };
        readonly window_definition: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["unit", "size"];
            readonly properties: {
                readonly unit: {
                    readonly type: "string";
                    readonly enum: MeasurementWindowUnit[];
                };
                readonly size: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
            };
        };
        readonly enforcement_mode: {
            readonly type: "string";
            readonly enum: EnforcementMode[];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=quota-policy.schema.d.ts.map