export declare const CANONICAL_EVENT_INTELLIGENCE_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/canonical-event.schema.json";
export declare const canonicalEventIntelligenceSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/canonical-event.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "subject", "action", "object_nullable", "event_type", "category", "time_window", "jurisdiction_nullable", "supporting_candidates", "supporting_observations", "conflicting_observations", "canonicalization_confidence", "dedupe_cluster_id", "graph_node_id_nullable"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly subject: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/subjectReference";
        };
        readonly action: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/actionReference";
        };
        readonly object_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/objectReference";
            }, {
                readonly type: "null";
            }];
        };
        readonly event_type: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly category: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly time_window: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/temporalWindow";
        };
        readonly jurisdiction_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/jurisdictionReference";
            }, {
                readonly type: "null";
            }];
        };
        readonly supporting_candidates: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
            };
        };
        readonly supporting_observations: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
            };
        };
        readonly conflicting_observations: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
            };
        };
        readonly canonicalization_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly dedupe_cluster_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventClusterId";
        };
        readonly graph_node_id_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventGraphNodeId";
            }, {
                readonly type: "null";
            }];
        };
    };
};
//# sourceMappingURL=canonical-event.schema.d.ts.map