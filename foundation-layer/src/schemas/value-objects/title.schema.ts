export const TITLE_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/value-objects/title.schema.json";

export const titleSchema = {
  $id: TITLE_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "string",
  minLength: 1,
  maxLength: 200,
} as const;
