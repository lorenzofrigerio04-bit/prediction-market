import { ConsistencyStatus } from "../enums/consistency-status.enum.js";
export declare const CREDITS_COMPATIBILITY_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/credits-compatibility-view.schema.json";
export declare const creditsCompatibilityViewSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credits-compatibility-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "owner_ref", "access_scope_ref", "account_ref_nullable", "visible_balance_nullable", "active_quota_refs", "active_risk_flags", "allowed_actions", "warnings", "compatibility_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly access_scope_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly account_ref_nullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly visible_balance_nullable: {
            readonly type: readonly ["number", "null"];
        };
        readonly active_quota_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly active_risk_flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly allowed_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly compatibility_status: {
            readonly type: "string";
            readonly enum: ConsistencyStatus[];
        };
    };
};
//# sourceMappingURL=credits-compatibility-view.schema.d.ts.map