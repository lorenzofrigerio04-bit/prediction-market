export const TIMESTAMP_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";

export const timestampSchema = {
  $id: TIMESTAMP_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "string",
  format: "date-time",
} as const;
