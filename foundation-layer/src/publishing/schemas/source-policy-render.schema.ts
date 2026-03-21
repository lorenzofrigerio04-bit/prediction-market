export const SOURCE_POLICY_RENDER_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/publishing/source-policy-render.schema.json";

export const sourcePolicyRenderSchema = {
  $id: SOURCE_POLICY_RENDER_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["selected_source_priority", "source_policy_text", "fallback_policy_text_nullable"],
  properties: {
    selected_source_priority: {
      type: "array",
      minItems: 1,
      items: { type: "string", minLength: 1 },
      uniqueItems: true,
    },
    source_policy_text: { type: "string", minLength: 1 },
    fallback_policy_text_nullable: { type: ["string", "null"] },
  },
} as const;
