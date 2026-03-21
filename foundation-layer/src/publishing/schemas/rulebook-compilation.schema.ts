import { CompilationStatus } from "../enums/compilation-status.enum.js";

export const RULEBOOK_COMPILATION_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/publishing/rulebook-compilation.schema.json";

export const rulebookCompilationSchema = {
  $id: RULEBOOK_COMPILATION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "market_draft_pipeline_id",
    "canonical_question",
    "contract_definition",
    "resolution_criteria",
    "source_policy",
    "time_policy",
    "edge_case_section",
    "invalidation_section",
    "examples_section",
    "included_sections",
    "compilation_status",
    "compilation_metadata",
  ],
  properties: {
    id: { type: "string", pattern: "^rbcmp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    market_draft_pipeline_id: { type: "string", pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    canonical_question: {
      $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json",
    },
    contract_definition: {
      $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json",
    },
    resolution_criteria: {
      $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json",
    },
    source_policy: {
      $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json",
    },
    time_policy: {
      $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json",
    },
    edge_case_section: {
      $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json",
    },
    invalidation_section: {
      $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json",
    },
    examples_section: {
      $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json",
    },
    included_sections: {
      type: "array",
      minItems: 1,
      items: {
        $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json",
      },
    },
    compilation_status: { type: "string", enum: Object.values(CompilationStatus) },
    compilation_metadata: { type: "object", additionalProperties: true },
  },
} as const;
