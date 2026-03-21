import { FamilyCompatibilityStatus } from "../enums/family-compatibility-status.enum.js";

export const MARKET_FAMILY_COMPATIBILITY_RESULT_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/market-expansion/market-family-compatibility-result.schema.json";

export const marketFamilyCompatibilityResultSchema = {
  $id: MARKET_FAMILY_COMPATIBILITY_RESULT_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["id", "target", "status", "mapped_artifact", "notes"],
  properties: {
    id: { type: "string", pattern: "^mcp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    target: {
      type: "string",
      enum: [
        "market_draft_pipeline",
        "publishable_candidate",
        "publication_ready_artifact",
        "editorial_pipeline",
      ],
    },
    status: { type: "string", enum: Object.values(FamilyCompatibilityStatus) },
    mapped_artifact: {
      type: "object",
      additionalProperties: true,
      required: ["readiness", "validation_status"],
      properties: {
        readiness: { type: "string", enum: Object.values(FamilyCompatibilityStatus) },
        validation_status: { anyOf: [{ type: "null" }, { type: "string" }] },
      },
    },
    notes: { type: "array", items: { type: "string", minLength: 1 } },
  },
} as const;
