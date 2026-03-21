export const EVENT_GRAPH_NODE_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/event-graph-node.schema.json";
export const eventGraphNodeSchema = {
    $id: EVENT_GRAPH_NODE_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "canonical_event_id",
        "incoming_relations",
        "outgoing_relations",
        "graph_metadata",
    ],
    properties: {
        id: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventGraphNodeId",
        },
        canonical_event_id: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId",
        },
        incoming_relations: {
            type: "array",
            items: {
                $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventRelationId",
            },
        },
        outgoing_relations: {
            type: "array",
            items: {
                $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventRelationId",
            },
        },
        graph_metadata: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/graphMetadata",
        },
    },
};
//# sourceMappingURL=event-graph-node.schema.js.map