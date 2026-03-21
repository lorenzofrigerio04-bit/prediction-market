import { RecommendationStatus } from "../enums/recommendation-status.enum.js";
export const LEARNING_RECOMMENDATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/learning-recommendation.schema.json";
export const learningRecommendationSchema = {
    $id: LEARNING_RECOMMENDATION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "correlation_id",
        "status",
        "recommendation_text",
        "blocking_dependency_refs",
        "planned_action_refs",
        "generated_at",
    ],
    properties: {
        id: { type: "string", pattern: "^lrc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        correlation_id: { type: "string", pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        status: { type: "string", enum: Object.values(RecommendationStatus) },
        recommendation_text: { type: "string", minLength: 1 },
        blocking_dependency_refs: { type: "array", items: { type: "string", minLength: 1 } },
        planned_action_refs: { type: "array", items: { type: "string", minLength: 1 } },
        generated_at: { type: "string", format: "date-time" },
    },
};
//# sourceMappingURL=learning-recommendation.schema.js.map