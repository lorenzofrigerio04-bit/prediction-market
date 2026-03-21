export const EVENT_INTELLIGENCE_SHARED_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json";

export const eventIntelligenceSharedSchema = {
  $id: EVENT_INTELLIGENCE_SHARED_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $defs: {
    observationInterpretationId: {
      type: "string",
      pattern: "^oint_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
    },
    eventCandidateId: {
      type: "string",
      pattern: "^ecnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
    },
    canonicalEventIntelligenceId: {
      type: "string",
      pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
    },
    eventGraphNodeId: {
      type: "string",
      pattern: "^egnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
    },
    eventRelationId: {
      type: "string",
      pattern: "^erel_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
    },
    eventClusterId: {
      type: "string",
      pattern: "^eclu_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
    },
    eventConflictId: {
      type: "string",
      pattern: "^ecfl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
    },
    temporalWindow: {
      type: "object",
      additionalProperties: false,
      required: ["start_at", "end_at"],
      properties: {
        start_at: {
          $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
        },
        end_at: {
          $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp",
        },
      },
    },
    evidenceSpan: {
      type: "object",
      additionalProperties: false,
      required: [
        "span_id",
        "source_observation_id",
        "locator",
        "start_offset",
        "end_offset",
        "extracted_text_nullable",
        "mapped_field_nullable",
      ],
      properties: {
        span_id: { type: "string", minLength: 1 },
        source_observation_id: {
          $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId",
        },
        locator: { type: "string", minLength: 1 },
        start_offset: { type: ["integer", "null"], minimum: 0 },
        end_offset: { type: ["integer", "null"], minimum: 0 },
        extracted_text_nullable: { type: ["string", "null"] },
        mapped_field_nullable: { type: ["string", "null"] },
      },
    },
    subjectReference: {
      type: "object",
      additionalProperties: false,
      required: ["value", "normalized_value", "entity_type"],
      properties: {
        value: { type: "string", minLength: 1 },
        normalized_value: { type: "string", minLength: 1 },
        entity_type: { type: "string", minLength: 1 },
      },
    },
    actionReference: {
      type: "object",
      additionalProperties: false,
      required: ["value", "normalized_value"],
      properties: {
        value: { type: "string", minLength: 1 },
        normalized_value: { type: "string", minLength: 1 },
      },
    },
    objectReference: {
      type: "object",
      additionalProperties: false,
      required: ["value", "normalized_value", "entity_type_nullable"],
      properties: {
        value: { type: "string", minLength: 1 },
        normalized_value: { type: "string", minLength: 1 },
        entity_type_nullable: { type: ["string", "null"] },
      },
    },
    jurisdictionReference: {
      type: "object",
      additionalProperties: false,
      required: ["code", "label_nullable"],
      properties: {
        code: { type: "string", pattern: "^[A-Z]{2,8}$" },
        label_nullable: { type: ["string", "null"] },
      },
    },
    graphMetadata: {
      type: "object",
      additionalProperties: false,
      required: ["created_from_candidate_ids", "relation_count"],
      properties: {
        created_from_candidate_ids: {
          type: "array",
          items: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId",
          },
        },
        relation_count: { type: "integer", minimum: 0 },
      },
    },
    similarityScore: {
      type: "object",
      additionalProperties: false,
      required: ["left_candidate_id", "right_candidate_id", "score"],
      properties: {
        left_candidate_id: {
          $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId",
        },
        right_candidate_id: {
          $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId",
        },
        score: {
          $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
      },
    },
    conflictDescriptor: {
      type: "object",
      additionalProperties: false,
      required: ["field", "left_value_nullable", "right_value_nullable"],
      properties: {
        field: { type: "string", minLength: 1 },
        left_value_nullable: { type: ["string", "null"] },
        right_value_nullable: { type: ["string", "null"] },
      },
    },
    normalizationMetadata: {
      type: "object",
      additionalProperties: false,
      required: ["strategy_id", "resolver_version"],
      properties: {
        strategy_id: { type: "string", minLength: 1 },
        resolver_version: { type: "string", minLength: 1 },
      },
    },
  },
} as const;
