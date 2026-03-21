export const CANONICAL_EVENT_INTELLIGENCE_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/canonical-event.schema.json";
export const canonicalEventIntelligenceSchema = {
    $id: CANONICAL_EVENT_INTELLIGENCE_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "subject",
        "action",
        "object_nullable",
        "event_type",
        "category",
        "time_window",
        "jurisdiction_nullable",
        "supporting_candidates",
        "supporting_observations",
        "conflicting_observations",
        "canonicalization_confidence",
        "dedupe_cluster_id",
        "graph_node_id_nullable",
    ],
    properties: {
        id: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId",
        },
        version: { type: "integer", minimum: 1 },
        subject: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/subjectReference",
        },
        action: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/actionReference",
        },
        object_nullable: {
            oneOf: [
                {
                    $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/objectReference",
                },
                { type: "null" },
            ],
        },
        event_type: { type: "string", minLength: 1 },
        category: { type: "string", minLength: 1 },
        time_window: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/temporalWindow",
        },
        jurisdiction_nullable: {
            oneOf: [
                {
                    $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/jurisdictionReference",
                },
                { type: "null" },
            ],
        },
        supporting_candidates: {
            type: "array",
            minItems: 1,
            items: {
                $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId",
            },
        },
        supporting_observations: {
            type: "array",
            minItems: 1,
            items: {
                $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId",
            },
        },
        conflicting_observations: {
            type: "array",
            items: {
                $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId",
            },
        },
        canonicalization_confidence: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
        dedupe_cluster_id: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventClusterId",
        },
        graph_node_id_nullable: {
            oneOf: [
                {
                    $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventGraphNodeId",
                },
                { type: "null" },
            ],
        },
    },
};
//# sourceMappingURL=canonical-event.schema.js.map