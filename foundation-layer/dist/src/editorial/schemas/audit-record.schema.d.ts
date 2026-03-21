import { ActionType } from "../enums/action-type.enum.js";
import { ReasonCode } from "../enums/reason-code.enum.js";
export declare const AUDIT_RECORD_SCHEMA_ID = "https://market-design-engine.dev/schemas/editorial/audit-record.schema.json";
export declare const auditRecordSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/audit-record.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "actor_id", "action_type", "target_type", "target_id", "action_timestamp", "action_payload_summary", "reason_codes", "correlation_id"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^aud_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly actor_id: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly action_type: {
            readonly type: "string";
            readonly enum: ActionType[];
        };
        readonly target_type: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly action_timestamp: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly action_payload_summary: {
            readonly type: "string";
            readonly minLength: 8;
        };
        readonly reason_codes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly enum: ReasonCode[];
            };
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
};
//# sourceMappingURL=audit-record.schema.d.ts.map