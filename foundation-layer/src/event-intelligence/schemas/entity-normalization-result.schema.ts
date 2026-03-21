export const ENTITY_NORMALIZATION_RESULT_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/event-intelligence/entity-normalization-result.schema.json";

export const entityNormalizationResultSchema = {
  $id: ENTITY_NORMALIZATION_RESULT_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "normalized_entities",
    "unresolved_entities",
    "normalization_confidence",
    "normalization_metadata",
  ],
  properties: {
    normalized_entities: {
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
    unresolved_entities: {
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
    normalization_confidence: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
    },
    normalization_metadata: {
      $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/normalizationMetadata",
    },
  },
} as const;
