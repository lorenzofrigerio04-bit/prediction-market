import { EventCategory } from "../../enums/event-category.enum.js";
import { EventPriority } from "../../enums/event-priority.enum.js";
import { EventStatus } from "../../enums/event-status.enum.js";

export const EVENT_SIGNAL_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/entities/event-signal.schema.json";

export const eventSignalSchema = {
  $id: EVENT_SIGNAL_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "sourceRecordIds",
    "rawHeadline",
    "rawSummary",
    "eventCategory",
    "eventPriority",
    "occurredAt",
    "detectedAt",
    "jurisdictions",
    "involvedEntities",
    "tags",
    "confidenceScore",
    "status",
    "entityVersion",
  ],
  properties: {
    id: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId",
    },
    sourceRecordIds: {
      type: "array",
      minItems: 1,
      items: {
        $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceId",
      },
    },
    rawHeadline: { $ref: "https://market-design-engine.dev/schemas/value-objects/title.schema.json" },
    rawSummary: { type: ["string", "null"] },
    eventCategory: { type: "string", enum: Object.values(EventCategory) },
    eventPriority: { type: "string", enum: Object.values(EventPriority) },
    occurredAt: {
      oneOf: [
        { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
        { type: "null" },
      ],
    },
    detectedAt: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
    jurisdictions: { type: "array", items: { type: "string" } },
    involvedEntities: { type: "array", items: { type: "string" } },
    tags: {
      type: "array",
      items: {
        $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag",
      },
    },
    confidenceScore: { $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json" },
    status: { type: "string", enum: Object.values(EventStatus) },
    entityVersion: { type: "integer", minimum: 1 },
  },
} as const;
