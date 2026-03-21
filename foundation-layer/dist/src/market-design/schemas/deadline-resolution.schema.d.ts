import { DeadlineBasisType } from "../enums/deadline-basis-type.enum.js";
export declare const DEADLINE_RESOLUTION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
export declare const deadlineResolutionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "canonical_event_id", "event_deadline", "market_close_time", "resolution_cutoff_nullable", "timezone", "deadline_basis_type", "deadline_basis_reference", "confidence", "warnings"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^dlr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly event_deadline: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly market_close_time: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly resolution_cutoff_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly timezone: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly deadline_basis_type: {
            readonly type: "string";
            readonly enum: DeadlineBasisType[];
        };
        readonly deadline_basis_reference: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
//# sourceMappingURL=deadline-resolution.schema.d.ts.map