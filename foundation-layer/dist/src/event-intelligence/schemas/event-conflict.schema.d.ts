import { ConflictType } from "../conflicts/enums/conflict-type.enum.js";
export declare const EVENT_CONFLICT_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/event-conflict.schema.json";
export declare const eventConflictSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/event-conflict.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "canonical_event_id_nullable", "candidate_id_nullable", "conflict_type", "description", "conflicting_fields", "related_observation_ids", "confidence"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventConflictId";
        };
        readonly canonical_event_id_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
            }, {
                readonly type: "null";
            }];
        };
        readonly candidate_id_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
            }, {
                readonly type: "null";
            }];
        };
        readonly conflict_type: {
            readonly type: "string";
            readonly enum: ConflictType[];
        };
        readonly description: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly conflicting_fields: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/conflictDescriptor";
            };
        };
        readonly related_observation_ids: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
            };
        };
        readonly confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
};
//# sourceMappingURL=event-conflict.schema.d.ts.map