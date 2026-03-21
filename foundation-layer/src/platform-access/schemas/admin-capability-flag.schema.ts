export const ADMIN_CAPABILITY_FLAG_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/platform-access/admin-capability-flag.schema.json";

export const adminCapabilityFlagSchema = {
  $id: ADMIN_CAPABILITY_FLAG_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["flag_key", "description", "sensitive", "default_enabled"],
  properties: {
    flag_key: { type: "string", minLength: 1 },
    description: { type: "string", minLength: 1 },
    sensitive: { type: "boolean" },
    default_enabled: { type: "boolean" },
  },
} as const;
