import { LearningInsightStatus } from "../enums/learning-insight-status.enum.js";
export const LEARNING_INSIGHT_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/learning-insight.schema.json";
export const learningInsightSchema = {
    $id: LEARNING_INSIGHT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "correlation_id",
        "insight_status",
        "title",
        "supporting_refs",
        "derived_recommendation_refs",
        "created_at",
    ],
    properties: {
        id: { type: "string", pattern: "^lin_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        correlation_id: { type: "string", pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        insight_status: { type: "string", enum: Object.values(LearningInsightStatus) },
        title: { type: "string", minLength: 1 },
        supporting_refs: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
        derived_recommendation_refs: { type: "array", items: { type: "string", minLength: 1 } },
        created_at: { type: "string", format: "date-time" },
    },
};
//# sourceMappingURL=learning-insight.schema.js.map