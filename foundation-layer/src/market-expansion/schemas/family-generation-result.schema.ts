import { GenerationStatus } from "../enums/generation-status.enum.js";

export const FAMILY_GENERATION_RESULT_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/market-expansion/family-generation-result.schema.json";

export const familyGenerationResultSchema = {
  $id: FAMILY_GENERATION_RESULT_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "market_family_id",
    "generated_market_refs",
    "flagship_ref",
    "generation_status",
    "generation_confidence",
    "output_notes_nullable",
  ],
  properties: {
    id: { type: "string", pattern: "^mgr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    market_family_id: { type: "string", pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    generated_market_refs: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: { type: "string", minLength: 1 },
    },
    flagship_ref: { type: "string", minLength: 1 },
    generation_status: { type: "string", enum: Object.values(GenerationStatus) },
    generation_confidence: { type: "number", minimum: 0, maximum: 1 },
    output_notes_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
  },
} as const;
