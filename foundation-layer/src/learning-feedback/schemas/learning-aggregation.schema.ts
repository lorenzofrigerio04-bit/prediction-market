import { AggregationStatus } from "../enums/aggregation-status.enum.js";

export const LEARNING_AGGREGATION_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/learning-feedback/learning-aggregation.schema.json";

export const learningAggregationSchema = {
  $id: LEARNING_AGGREGATION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "correlation_id",
    "aggregation_status",
    "input_signal_refs",
    "aggregated_insight_refs",
    "generated_at",
  ],
  properties: {
    id: { type: "string", pattern: "^lag_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    correlation_id: { type: "string", pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    aggregation_status: { type: "string", enum: Object.values(AggregationStatus) },
    input_signal_refs: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
    aggregated_insight_refs: { type: "array", items: { type: "string", minLength: 1 } },
    generated_at: { type: "string", format: "date-time" },
  },
} as const;
