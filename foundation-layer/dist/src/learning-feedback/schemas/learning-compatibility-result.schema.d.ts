import { LearningCompatibilityStatus } from "../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../enums/learning-compatibility-target.enum.js";
export declare const LEARNING_COMPATIBILITY_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/learning-compatibility-result.schema.json";
export declare const learningCompatibilityResultSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/learning-compatibility-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "correlation_id", "target", "status", "mapped_artifact", "notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lcp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly target: {
            readonly type: "string";
            readonly enum: LearningCompatibilityTarget[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: LearningCompatibilityStatus[];
        };
        readonly mapped_artifact: {
            readonly type: "object";
            readonly additionalProperties: true;
            readonly required: readonly ["source_id", "target_id", "readiness", "lossy_fields"];
            readonly properties: {
                readonly source_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly target_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly readiness: {
                    readonly type: "string";
                    readonly enum: LearningCompatibilityStatus[];
                };
                readonly lossy_fields: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
//# sourceMappingURL=learning-compatibility-result.schema.d.ts.map