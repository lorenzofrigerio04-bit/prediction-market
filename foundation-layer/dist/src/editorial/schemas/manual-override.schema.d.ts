import { OverrideType } from "../enums/override-type.enum.js";
export declare const MANUAL_OVERRIDE_SCHEMA_ID = "https://market-design-engine.dev/schemas/editorial/manual-override.schema.json";
export declare const manualOverrideSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/manual-override.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_entity_type", "target_entity_id", "override_type", "initiated_by", "initiated_at", "override_reason", "override_scope", "expiration_nullable", "audit_reference_id"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ovr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly target_entity_type: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_entity_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly override_type: {
            readonly type: "string";
            readonly enum: OverrideType[];
        };
        readonly initiated_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly initiated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly override_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly override_scope: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["affected_fields", "allow_readiness_gate_bypass"];
            readonly properties: {
                readonly affected_fields: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly allow_readiness_gate_bypass: {
                    readonly type: "boolean";
                };
            };
        };
        readonly expiration_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly format: "date-time";
            }, {
                readonly type: "null";
            }];
        };
        readonly audit_reference_id: {
            readonly type: "string";
            readonly pattern: "^aref_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
};
//# sourceMappingURL=manual-override.schema.d.ts.map