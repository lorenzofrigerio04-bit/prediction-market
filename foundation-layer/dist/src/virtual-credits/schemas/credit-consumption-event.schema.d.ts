import { ConsumptionStatus } from "../enums/consumption-status.enum.js";
export declare const CREDIT_CONSUMPTION_EVENT_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/credit-consumption-event.schema.json";
export declare const creditConsumptionEventSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credit-consumption-event.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "account_id", "action_key", "consumption_amount", "consumed_at", "related_entity_ref_nullable", "quota_evaluation_ref_nullable", "consumption_status", "notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vce_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly action_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly consumption_amount: {
            readonly type: "number";
        };
        readonly consumed_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly related_entity_ref_nullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly quota_evaluation_ref_nullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly consumption_status: {
            readonly type: "string";
            readonly enum: ConsumptionStatus[];
        };
        readonly notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
};
//# sourceMappingURL=credit-consumption-event.schema.d.ts.map