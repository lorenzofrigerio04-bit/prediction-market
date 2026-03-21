import { TriggerType } from "../enums/trigger-type.enum.js";
export declare const TRIGGER_CONDITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/trigger-condition.schema.json";
export declare const triggerConditionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/trigger-condition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["trigger_type", "upstream_event_ref_or_market_ref", "triggering_outcome", "trigger_deadline_nullable", "trigger_policy_notes"];
    readonly properties: {
        readonly trigger_type: {
            readonly type: "string";
            readonly enum: TriggerType[];
        };
        readonly upstream_event_ref_or_market_ref: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "event_id"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "upstream_event";
                    };
                    readonly event_id: {
                        readonly type: "string";
                        readonly pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "market_id"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "upstream_market";
                    };
                    readonly market_id: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            }];
        };
        readonly triggering_outcome: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly trigger_deadline_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
            }];
        };
        readonly trigger_policy_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
//# sourceMappingURL=trigger-condition.schema.d.ts.map