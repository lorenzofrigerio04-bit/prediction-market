export declare const OBSERVATION_INTERPRETATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/observation-interpretation.schema.json";
export declare const observationInterpretationSchema: {
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
};
//# sourceMappingURL=observation-interpretation.schema.d.ts.map