export declare const EVENT_GRAPH_NODE_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/event-graph-node.schema.json";
export declare const eventGraphNodeSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/event-graph-node.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "canonical_event_id", "incoming_relations", "outgoing_relations", "graph_metadata"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventGraphNodeId";
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly incoming_relations: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventRelationId";
            };
        };
        readonly outgoing_relations: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventRelationId";
            };
        };
        readonly graph_metadata: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/graphMetadata";
        };
    };
};
//# sourceMappingURL=event-graph-node.schema.d.ts.map