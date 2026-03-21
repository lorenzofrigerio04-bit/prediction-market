import { FinalReadinessStatus } from "../enums/final-readiness-status.enum.js";

export const PUBLICATION_READY_ARTIFACT_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/editorial/publication-ready-artifact.schema.json";

export const publicationReadyArtifactSchema = {
  $id: PUBLICATION_READY_ARTIFACT_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "publishable_candidate_id",
    "final_readiness_status",
    "approved_artifacts",
    "gating_summary",
    "generated_at",
    "generated_by",
    "handoff_notes_nullable",
  ],
  properties: {
    id: { type: "string", pattern: "^prad_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    publishable_candidate_id: { type: "string", pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    final_readiness_status: { type: "string", enum: Object.values(FinalReadinessStatus) },
    approved_artifacts: {
      type: "array",
      items: { type: "string", pattern: "^apd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    },
    gating_summary: {
      type: "object",
      additionalProperties: false,
      required: [
        "readiness_status",
        "has_valid_approval",
        "has_terminal_rejection",
        "unresolved_blocking_flags_count",
        "checks",
      ],
      properties: {
        readiness_status: { type: "string", enum: Object.values(FinalReadinessStatus) },
        has_valid_approval: { type: "boolean" },
        has_terminal_rejection: { type: "boolean" },
        unresolved_blocking_flags_count: { type: "integer", minimum: 0 },
        checks: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
      },
    },
    generated_at: { type: "string", format: "date-time" },
    generated_by: { type: "string", pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    handoff_notes_nullable: { anyOf: [{ type: "string" }, { type: "null" }] },
  },
} as const;
