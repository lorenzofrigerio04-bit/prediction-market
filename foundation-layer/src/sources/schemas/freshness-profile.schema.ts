import { RecencyPriority } from "../enums/recency-priority.enum.js";

export const FRESHNESS_PROFILE_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/sources/freshness-profile.schema.json";

export const freshnessProfileSchema = {
  $id: FRESHNESS_PROFILE_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["expectedUpdateFrequency", "freshnessTtl", "recencyPriority"],
  properties: {
    expectedUpdateFrequency: { type: "string", minLength: 1 },
    freshnessTtl: { type: "integer", minimum: 0 },
    recencyPriority: { type: "string", enum: Object.values(RecencyPriority) },
  },
} as const;
