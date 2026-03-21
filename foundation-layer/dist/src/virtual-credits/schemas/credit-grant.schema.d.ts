import { GrantStatus } from "../enums/grant-status.enum.js";
import { GrantType } from "../enums/grant-type.enum.js";
export declare const CREDIT_GRANT_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/credit-grant.schema.json";
export declare const creditGrantSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credit-grant.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_account_id", "grant_type", "amount", "issued_by", "issued_at", "expiration_nullable", "grant_reason", "grant_status", "source_policy_ref_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vcg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly grant_type: {
            readonly type: "string";
            readonly enum: GrantType[];
        };
        readonly amount: {
            readonly type: "number";
        };
        readonly issued_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly issued_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly expiration_nullable: {
            readonly type: readonly ["string", "null"];
            readonly format: "date-time";
        };
        readonly grant_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly grant_status: {
            readonly type: "string";
            readonly enum: GrantStatus[];
        };
        readonly source_policy_ref_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
};
//# sourceMappingURL=credit-grant.schema.d.ts.map