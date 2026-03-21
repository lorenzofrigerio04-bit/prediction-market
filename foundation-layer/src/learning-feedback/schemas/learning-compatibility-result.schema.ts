import { LearningCompatibilityStatus } from "../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../enums/learning-compatibility-target.enum.js";

export const LEARNING_COMPATIBILITY_RESULT_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/learning-feedback/learning-compatibility-result.schema.json";

export const learningCompatibilityResultSchema = {
  $id: LEARNING_COMPATIBILITY_RESULT_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["id", "correlation_id", "target", "status", "mapped_artifact", "notes"],
  properties: {
    id: { type: "string", pattern: "^lcp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    correlation_id: { type: "string", pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    target: { type: "string", enum: Object.values(LearningCompatibilityTarget) },
    status: { type: "string", enum: Object.values(LearningCompatibilityStatus) },
    mapped_artifact: {
      type: "object",
      additionalProperties: true,
      required: ["source_id", "target_id", "readiness", "lossy_fields"],
      properties: {
        source_id: { type: "string", minLength: 1 },
        target_id: { type: "string", minLength: 1 },
        readiness: { type: "string", enum: Object.values(LearningCompatibilityStatus) },
        lossy_fields: { type: "array", items: { type: "string", minLength: 1 } },
      },
    },
    notes: { type: "array", items: { type: "string", minLength: 1 } },
  },
} as const;
