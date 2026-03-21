export declare const ENTITY_NORMALIZATION_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/entity-normalization-result.schema.json";
export declare const entityNormalizationResultSchema: {
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
};
//# sourceMappingURL=entity-normalization-result.schema.d.ts.map