import { RelationType } from "../graph/enums/relation-type.enum.js";
export declare const EVENT_RELATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/event-relation.schema.json";
export declare const eventRelationSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/event-relation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "source_event_id", "target_event_id", "relation_type", "relation_confidence"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventRelationId";
        };
        readonly source_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly target_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly relation_type: {
            readonly type: "string";
            readonly enum: RelationType[];
        };
        readonly relation_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
};
//# sourceMappingURL=event-relation.schema.d.ts.map