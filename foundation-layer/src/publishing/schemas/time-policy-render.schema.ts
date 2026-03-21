export const TIME_POLICY_RENDER_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/publishing/time-policy-render.schema.json";

export const timePolicyRenderSchema = {
  $id: TIME_POLICY_RENDER_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "timezone",
    "deadline_text",
    "close_time_text",
    "cutoff_text_nullable",
    "policy_notes",
    "metadata",
  ],
  properties: {
    timezone: { type: "string", minLength: 1 },
    deadline_text: { type: "string", minLength: 1 },
    close_time_text: { type: "string", minLength: 1 },
    cutoff_text_nullable: { type: ["string", "null"] },
    policy_notes: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
    metadata: { type: "object", additionalProperties: true },
  },
} as const;
