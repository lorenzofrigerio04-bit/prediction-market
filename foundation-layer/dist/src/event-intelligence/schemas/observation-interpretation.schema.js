export const OBSERVATION_INTERPRETATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/observation-interpretation.schema.json";
export const observationInterpretationSchema = {
    $id: OBSERVATION_INTERPRETATION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "source_observation_id",
        "interpreted_entities",
        "interpreted_dates",
        "interpreted_numbers",
        "interpreted_claims",
        "semantic_confidence",
        "interpretation_metadata",
    ],
    properties: {
        id: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/observationInterpretationId",
        },
        version: { type: "integer", minimum: 1 },
        source_observation_id: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId",
        },
        interpreted_entities: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["value", "normalized_value", "entity_type", "confidence", "evidence_spans"],
                properties: {
                    value: { type: "string", minLength: 1 },
                    normalized_value: { type: "string", minLength: 1 },
                    entity_type: { type: "string", minLength: 1 },
                    confidence: {
                        $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
                    },
                    evidence_spans: {
                        type: "array",
                        items: {
                            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan",
                        },
                    },
                },
            },
        },
        interpreted_dates: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["original_value", "resolved_timestamp_nullable", "confidence", "evidence_spans"],
                properties: {
                    original_value: { type: "string", minLength: 1 },
                    resolved_timestamp_nullable: {
                        oneOf: [
                            {
                                $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
                            },
                            { type: "null" },
                        ],
                    },
                    confidence: {
                        $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
                    },
                    evidence_spans: {
                        type: "array",
                        items: {
                            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan",
                        },
                    },
                },
            },
        },
        interpreted_numbers: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["original_value", "unit_nullable", "confidence", "evidence_spans"],
                properties: {
                    original_value: { type: "number" },
                    unit_nullable: { type: ["string", "null"] },
                    confidence: {
                        $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
                    },
                    evidence_spans: {
                        type: "array",
                        items: {
                            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan",
                        },
                    },
                },
            },
        },
        interpreted_claims: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["text", "polarity", "confidence", "evidence_spans"],
                properties: {
                    text: { type: "string", minLength: 1 },
                    polarity: { type: "string", enum: ["AFFIRMATIVE", "NEGATIVE", "UNCERTAIN"] },
                    confidence: {
                        $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
                    },
                    evidence_spans: {
                        type: "array",
                        items: {
                            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan",
                        },
                    },
                },
            },
        },
        semantic_confidence: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
        interpretation_metadata: {
            type: "object",
            additionalProperties: false,
            required: ["interpreter_version", "strategy_ids", "deterministic"],
            properties: {
                interpreter_version: { type: "string", minLength: 1 },
                strategy_ids: {
                    type: "array",
                    minItems: 1,
                    items: { type: "string", minLength: 1 },
                },
                deterministic: { type: "boolean" },
            },
        },
    },
};
//# sourceMappingURL=observation-interpretation.schema.js.map