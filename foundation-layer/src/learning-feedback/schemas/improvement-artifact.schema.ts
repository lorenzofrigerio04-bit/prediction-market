import { ImprovementArtifactType } from "../enums/improvement-artifact-type.enum.js";

export const IMPROVEMENT_ARTIFACT_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/learning-feedback/improvement-artifact.schema.json";

export const improvementArtifactSchema = {
  $id: IMPROVEMENT_ARTIFACT_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "correlation_id",
    "artifact_type",
    "derived_from_refs",
    "safety_constraints",
    "rollout_notes",
    "created_at",
  ],
  properties: {
    id: { type: "string", pattern: "^lia_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    correlation_id: { type: "string", pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    artifact_type: { type: "string", enum: Object.values(ImprovementArtifactType) },
    derived_from_refs: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
    safety_constraints: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
    rollout_notes: { type: "array", items: { type: "string", minLength: 1 } },
    created_at: { type: "string", format: "date-time" },
  },
} as const;
