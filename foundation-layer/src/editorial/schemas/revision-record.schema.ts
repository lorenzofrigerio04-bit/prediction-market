export const REVISION_RECORD_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/editorial/revision-record.schema.json";

export const revisionRecordSchema = {
  $id: REVISION_RECORD_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "target_entity_type",
    "target_entity_id",
    "revision_number",
    "changed_fields",
    "changed_by",
    "changed_at",
    "revision_reason",
  ],
  properties: {
    id: { type: "string", pattern: "^rev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    target_entity_type: { type: "string", minLength: 1 },
    target_entity_id: { type: "string", minLength: 1 },
    revision_number: { type: "integer", minimum: 1 },
    changed_fields: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["field_path", "previous_value_summary", "new_value_summary"],
        properties: {
          field_path: { type: "string", minLength: 1 },
          previous_value_summary: { type: "string", minLength: 1 },
          new_value_summary: { type: "string", minLength: 1 },
        },
      },
    },
    changed_by: { type: "string", pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    changed_at: { type: "string", format: "date-time" },
    revision_reason: { type: "string", minLength: 1 },
  },
} as const;
