import { EmergencyState } from "../enums/emergency-state.enum.js";
export declare const EMERGENCY_CONTROL_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/emergency-control.schema.json";
export declare const emergencyControlSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/emergency-control.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "state", "reason", "activated_by", "activated_at", "expires_at_nullable", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^age_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly state: {
            readonly type: "string";
            readonly enum: EmergencyState[];
        };
        readonly reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly activated_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly activated_at: {
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
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
};
//# sourceMappingURL=emergency-control.schema.d.ts.map