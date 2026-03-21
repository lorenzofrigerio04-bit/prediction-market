import { TitleGenerationStatus } from "../enums/title-generation-status.enum.js";

export const TITLE_SET_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/publishing/title-set.schema.json";

export const titleSetSchema = {
  $id: TITLE_SET_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "market_draft_pipeline_id",
    "canonical_title",
    "display_title",
    "subtitle",
    "title_generation_status",
    "generation_metadata",
  ],
  properties: {
    id: { type: "string", pattern: "^tset_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    market_draft_pipeline_id: { type: "string", pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    canonical_title: { type: "string", minLength: 1 },
    display_title: { type: "string", minLength: 1 },
    subtitle: { type: ["string", "null"] },
    title_generation_status: { type: "string", enum: Object.values(TitleGenerationStatus) },
    generation_metadata: { type: "object", additionalProperties: true },
  },
} as const;
