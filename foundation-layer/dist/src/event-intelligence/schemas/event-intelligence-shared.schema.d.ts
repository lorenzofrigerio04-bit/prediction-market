export declare const EVENT_INTELLIGENCE_SHARED_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json";
export declare const eventIntelligenceSharedSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly $defs: {
        readonly observationInterpretationId: {
            readonly type: "string";
            readonly pattern: "^oint_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly eventCandidateId: {
            readonly type: "string";
            readonly pattern: "^ecnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonicalEventIntelligenceId: {
            readonly type: "string";
            readonly pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly eventGraphNodeId: {
            readonly type: "string";
            readonly pattern: "^egnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly eventRelationId: {
            readonly type: "string";
            readonly pattern: "^erel_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly eventClusterId: {
            readonly type: "string";
            readonly pattern: "^eclu_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly eventConflictId: {
            readonly type: "string";
            readonly pattern: "^ecfl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly temporalWindow: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["start_at", "end_at"];
            readonly properties: {
                readonly start_at: {
                    readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
                };
                readonly end_at: {
                    readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
                };
            };
        };
        readonly evidenceSpan: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["span_id", "source_observation_id", "locator", "start_offset", "end_offset", "extracted_text_nullable", "mapped_field_nullable"];
            readonly properties: {
                readonly span_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly source_observation_id: {
                    readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
                };
                readonly locator: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly start_offset: {
                    readonly type: readonly ["integer", "null"];
                    readonly minimum: 0;
                };
                readonly end_offset: {
                    readonly type: readonly ["integer", "null"];
                    readonly minimum: 0;
                };
                readonly extracted_text_nullable: {
                    readonly type: readonly ["string", "null"];
                };
                readonly mapped_field_nullable: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
        readonly subjectReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["value", "normalized_value", "entity_type"];
            readonly properties: {
                readonly value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly normalized_value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly entity_type: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly actionReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["value", "normalized_value"];
            readonly properties: {
                readonly value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly normalized_value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly objectReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["value", "normalized_value", "entity_type_nullable"];
            readonly properties: {
                readonly value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly normalized_value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly entity_type_nullable: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
        readonly jurisdictionReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "label_nullable"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly pattern: "^[A-Z]{2,8}$";
                };
                readonly label_nullable: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
        readonly graphMetadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["created_from_candidate_ids", "relation_count"];
            readonly properties: {
                readonly created_from_candidate_ids: {
                    readonly type: "array";
                    readonly items: {
                        readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
                    };
                };
                readonly relation_count: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
        readonly similarityScore: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["left_candidate_id", "right_candidate_id", "score"];
            readonly properties: {
                readonly left_candidate_id: {
                    readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
                };
                readonly right_candidate_id: {
                    readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
                };
                readonly score: {
                    readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                };
            };
        };
        readonly conflictDescriptor: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["field", "left_value_nullable", "right_value_nullable"];
            readonly properties: {
                readonly field: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly left_value_nullable: {
                    readonly type: readonly ["string", "null"];
                };
                readonly right_value_nullable: {
                    readonly type: readonly ["string", "null"];
                };
            };
        };
        readonly normalizationMetadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["strategy_id", "resolver_version"];
            readonly properties: {
                readonly strategy_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly resolver_version: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
    };
};
//# sourceMappingURL=event-intelligence-shared.schema.d.ts.map