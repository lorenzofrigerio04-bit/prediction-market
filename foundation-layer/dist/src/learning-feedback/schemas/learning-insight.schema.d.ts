import { LearningInsightStatus } from "../enums/learning-insight-status.enum.js";
export declare const LEARNING_INSIGHT_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/learning-insight.schema.json";
export declare const learningInsightSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/learning-insight.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "insight_status", "title", "supporting_refs", "derived_recommendation_refs", "created_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lin_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly insight_status: {
            readonly type: "string";
            readonly enum: LearningInsightStatus[];
        };
        readonly title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly supporting_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly derived_recommendation_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
};
//# sourceMappingURL=learning-insight.schema.d.ts.map