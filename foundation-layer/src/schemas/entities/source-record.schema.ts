import { SourceType } from "../../enums/source-type.enum.js";

export const SOURCE_RECORD_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/entities/source-record.schema.json";

export const sourceRecordSchema = {
  $id: SOURCE_RECORD_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "sourceType",
    "sourceName",
    "sourceAuthorityScore",
    "title",
    "description",
    "url",
    "publishedAt",
    "capturedAt",
    "locale",
    "tags",
    "externalRef",
    "entityVersion",
  ],
  properties: {
    id: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceId",
    },
    sourceType: { type: "string", enum: Object.values(SourceType) },
    sourceName: { type: "string", minLength: 1 },
    sourceAuthorityScore: {
      oneOf: [
        { $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json" },
        { type: "null" },
      ],
    },
    title: { $ref: "https://market-design-engine.dev/schemas/value-objects/title.schema.json" },
    description: { type: ["string", "null"] },
    url: {
      oneOf: [
        { $ref: "https://market-design-engine.dev/schemas/value-objects/url.schema.json" },
        { type: "null" },
      ],
    },
    publishedAt: {
      oneOf: [
        { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
        { type: "null" },
      ],
    },
    capturedAt: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
    locale: {
      oneOf: [
        {
          $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/locale",
        },
        { type: "null" },
      ],
    },
    tags: {
      type: "array",
      items: {
        $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag",
      },
    },
    externalRef: { type: ["string", "null"] },
    entityVersion: { type: "integer", minimum: 1 },
  },
} as const;
