import { RecommendationStatus } from "../enums/recommendation-status.enum.js";
export declare const LEARNING_RECOMMENDATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/learning-recommendation.schema.json";
export declare const learningRecommendationSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/learning-recommendation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "status", "recommendation_text", "blocking_dependency_refs", "planned_action_refs", "generated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lrc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: RecommendationStatus[];
        };
        readonly recommendation_text: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly blocking_dependency_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly planned_action_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly generated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
};
//# sourceMappingURL=learning-recommendation.schema.d.ts.map