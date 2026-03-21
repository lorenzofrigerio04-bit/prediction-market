import { PatternStatus } from "../enums/pattern-status.enum.js";
import { ReleaseImpact } from "../enums/release-impact.enum.js";

export const RELIABILITY_LEARNING_SIGNAL_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/learning-feedback/reliability-learning-signal.schema.json";

export const reliabilityLearningSignalSchema = {
  $id: RELIABILITY_LEARNING_SIGNAL_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "correlation_id",
    "release_impact",
    "safe_to_ignore",
    "ignored_ready",
    "active_pattern",
    "pattern_status",
    "occurrence_count",
    "evidence_refs",
    "created_at",
  ],
  properties: {
    id: { type: "string", pattern: "^lrs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    correlation_id: { type: "string", pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    release_impact: { type: "string", enum: Object.values(ReleaseImpact) },
    safe_to_ignore: { type: "boolean" },
    ignored_ready: { type: "boolean" },
    active_pattern: { type: "boolean" },
    pattern_status: { type: "string", enum: Object.values(PatternStatus) },
    occurrence_count: { type: "integer", minimum: 0 },
    evidence_refs: { type: "array", items: { type: "string", minLength: 1 } },
    created_at: { type: "string", format: "date-time" },
  },
} as const;
