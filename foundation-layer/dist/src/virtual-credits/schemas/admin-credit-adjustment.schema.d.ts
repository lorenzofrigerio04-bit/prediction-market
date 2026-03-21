import { AdjustmentType } from "../enums/adjustment-type.enum.js";
import { AppliedStatus } from "../enums/applied-status.enum.js";
export declare const ADMIN_CREDIT_ADJUSTMENT_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/admin-credit-adjustment.schema.json";
export declare const adminCreditAdjustmentSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/admin-credit-adjustment.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_account_id", "adjustment_type", "amount_delta", "initiated_by", "initiated_at", "adjustment_reason", "audit_ref", "applied_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vaa_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly adjustment_type: {
            readonly type: "string";
            readonly enum: AdjustmentType[];
        };
        readonly amount_delta: {
            readonly type: "number";
        };
        readonly initiated_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly initiated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly adjustment_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly applied_status: {
            readonly type: "string";
            readonly enum: AppliedStatus[];
        };
    };
};
//# sourceMappingURL=admin-credit-adjustment.schema.d.ts.map