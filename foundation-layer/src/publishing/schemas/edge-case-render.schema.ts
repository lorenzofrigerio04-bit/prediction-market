export const EDGE_CASE_RENDER_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/publishing/edge-case-render.schema.json";

export const edgeCaseRenderSchema = {
  $id: EDGE_CASE_RENDER_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["edge_case_items", "invalidation_items", "notes_nullable"],
  properties: {
    edge_case_items: {
      type: "array",
      items: { type: "string", minLength: 1 },
      uniqueItems: true,
      minItems: 1,
    },
    invalidation_items: {
      type: "array",
      items: { type: "string", minLength: 1 },
      uniqueItems: true,
      minItems: 1,
    },
    notes_nullable: { type: ["string", "null"] },
  },
} as const;
