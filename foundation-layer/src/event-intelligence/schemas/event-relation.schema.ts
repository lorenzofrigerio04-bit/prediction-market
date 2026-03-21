import { RelationType } from "../graph/enums/relation-type.enum.js";

export const EVENT_RELATION_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/event-intelligence/event-relation.schema.json";

export const eventRelationSchema = {
  $id: EVENT_RELATION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["id", "source_event_id", "target_event_id", "relation_type", "relation_confidence"],
  properties: {
    id: {
      $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventRelationId",
    },
    source_event_id: {
      $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId",
    },
    target_event_id: {
      $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId",
    },
    relation_type: {
      type: "string",
      enum: Object.values(RelationType),
    },
    relation_confidence: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
    },
  },
} as const;
