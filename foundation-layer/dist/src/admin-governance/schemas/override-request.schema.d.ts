import { OverrideStatus } from "../enums/override-status.enum.js";
export declare const OVERRIDE_REQUEST_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/override-request.schema.json";
export declare const overrideRequestSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/override-request.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "operation_key", "requested_by", "reason", "status", "requested_at", "expires_at_nullable", "resolved_by_nullable", "audit_ref", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ago_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
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
        readonly requested_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: OverrideStatus[];
        };
        readonly requested_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly expires_at_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly format: "date-time";
            }];
        };
        readonly resolved_by_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
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
//# sourceMappingURL=override-request.schema.d.ts.map