import { eventIntelligenceSharedSchema } from "./event-intelligence-shared.schema.js";
import { observationInterpretationSchema } from "./observation-interpretation.schema.js";
import { eventCandidateSchema } from "./event-candidate.schema.js";
import { canonicalEventIntelligenceSchema } from "./canonical-event.schema.js";
import { eventRelationSchema } from "./event-relation.schema.js";
import { eventGraphNodeSchema } from "./event-graph-node.schema.js";
import { entityNormalizationResultSchema } from "./entity-normalization-result.schema.js";
import { eventClusterSchema } from "./event-cluster.schema.js";
import { deduplicationDecisionSchema } from "./deduplication-decision.schema.js";
import { eventConflictSchema } from "./event-conflict.schema.js";
export declare const eventIntelligenceSchemas: readonly [{
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/observation-interpretation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "source_observation_id", "interpreted_entities", "interpreted_dates", "interpreted_numbers", "interpreted_claims", "semantic_confidence", "interpretation_metadata"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/observationInterpretationId";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly source_observation_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
        };
        readonly interpreted_entities: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["value", "normalized_value", "entity_type", "confidence", "evidence_spans"];
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
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                    readonly evidence_spans: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
                        };
                    };
                };
            };
        };
        readonly interpreted_dates: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["original_value", "resolved_timestamp_nullable", "confidence", "evidence_spans"];
                readonly properties: {
                    readonly original_value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly resolved_timestamp_nullable: {
                        readonly oneOf: readonly [{
                            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
                        }, {
                            readonly type: "null";
                        }];
                    };
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                    readonly evidence_spans: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
                        };
                    };
                };
            };
        };
        readonly interpreted_numbers: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["original_value", "unit_nullable", "confidence", "evidence_spans"];
                readonly properties: {
                    readonly original_value: {
                        readonly type: "number";
                    };
                    readonly unit_nullable: {
                        readonly type: readonly ["string", "null"];
                    };
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                    readonly evidence_spans: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
                        };
                    };
                };
            };
        };
        readonly interpreted_claims: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["text", "polarity", "confidence", "evidence_spans"];
                readonly properties: {
                    readonly text: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly polarity: {
                        readonly type: "string";
                        readonly enum: readonly ["AFFIRMATIVE", "NEGATIVE", "UNCERTAIN"];
                    };
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                    readonly evidence_spans: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
                        };
                    };
                };
            };
        };
        readonly semantic_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly interpretation_metadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["interpreter_version", "strategy_ids", "deterministic"];
            readonly properties: {
                readonly interpreter_version: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly strategy_ids: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly deterministic: {
                    readonly type: "boolean";
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/event-candidate.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "observation_ids", "subject_candidate", "action_candidate", "object_candidate_nullable", "temporal_window_candidate", "jurisdiction_candidate_nullable", "category_candidate", "extraction_confidence", "evidence_spans", "candidate_status"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly observation_ids: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
            };
        };
        readonly subject_candidate: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/subjectReference";
        };
        readonly action_candidate: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/actionReference";
        };
        readonly object_candidate_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/objectReference";
            }, {
                readonly type: "null";
            }];
        };
        readonly temporal_window_candidate: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/temporalWindow";
        };
        readonly jurisdiction_candidate_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/jurisdictionReference";
            }, {
                readonly type: "null";
            }];
        };
        readonly category_candidate: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly extraction_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly evidence_spans: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
            };
        };
        readonly candidate_status: {
            readonly type: "string";
            readonly enum: import("../index.js").CandidateStatus[];
        };
    };
}, {
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
}, {
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
            readonly enum: import("../index.js").RelationType[];
        };
        readonly relation_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
}, {
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/entity-normalization-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["normalized_entities", "unresolved_entities", "normalization_confidence", "normalization_metadata"];
    readonly properties: {
        readonly normalized_entities: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["value", "normalized_value", "entity_type", "confidence", "evidence_spans"];
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
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                    readonly evidence_spans: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
                        };
                    };
                };
            };
        };
        readonly unresolved_entities: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["value", "normalized_value", "entity_type", "confidence", "evidence_spans"];
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
                    readonly confidence: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
                    };
                    readonly evidence_spans: {
                        readonly type: "array";
                        readonly items: {
                            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
                        };
                    };
                };
            };
        };
        readonly normalization_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly normalization_metadata: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/normalizationMetadata";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/event-cluster.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["cluster_id", "candidate_ids", "similarity_scores", "cluster_confidence", "cluster_status"];
    readonly properties: {
        readonly cluster_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventClusterId";
        };
        readonly candidate_ids: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
            };
        };
        readonly similarity_scores: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/similarityScore";
            };
        };
        readonly cluster_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly cluster_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ClusterStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/deduplication-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["candidate_id", "canonical_event_id", "decision_type", "decision_confidence"];
    readonly properties: {
        readonly candidate_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly decision_type: {
            readonly type: "string";
            readonly enum: import("../index.js").DeduplicationDecisionType[];
        };
        readonly decision_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
}, {
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
            readonly enum: import("../index.js").ConflictType[];
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
}];
export { eventIntelligenceSharedSchema, observationInterpretationSchema, eventCandidateSchema, canonicalEventIntelligenceSchema, eventRelationSchema, eventGraphNodeSchema, entityNormalizationResultSchema, eventClusterSchema, deduplicationDecisionSchema, eventConflictSchema, };
//# sourceMappingURL=index.d.ts.map