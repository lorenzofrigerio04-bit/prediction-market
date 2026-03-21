import { editorialFeedbackSignalSchema } from "./editorial-feedback-signal.schema.js";
import { reliabilityLearningSignalSchema } from "./reliability-learning-signal.schema.js";
import { learningAggregationSchema } from "./learning-aggregation.schema.js";
import { learningInsightSchema } from "./learning-insight.schema.js";
import { learningRecommendationSchema } from "./learning-recommendation.schema.js";
import { improvementArtifactSchema } from "./improvement-artifact.schema.js";
import { learningCompatibilityResultSchema } from "./learning-compatibility-result.schema.js";
import { feedbackSignalSchema } from "./feedback-signal.schema.js";
import { editorialFeedbackSchema } from "./editorial-feedback.schema.js";
import { rejectionPatternSchema } from "./rejection-pattern.schema.js";
import { overridePatternSchema } from "./override-pattern.schema.js";
import { reliabilityFeedbackSchema } from "./reliability-feedback.schema.js";
import { feedbackAggregationSchema } from "./feedback-aggregation.schema.js";
import { recommendationSetSchema } from "./recommendation-set.schema.js";
import { generatorImprovementArtifactSchema } from "./generator-improvement-artifact.schema.js";
export declare const learningFeedbackSchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/feedback-signal.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["signal_type", "payload"];
    readonly properties: {
        readonly signal_type: {
            readonly type: "string";
            readonly enum: import("../index.js").SignalType[];
        };
        readonly payload: {
            readonly type: "object";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/rejection-pattern.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "status", "reason_codes", "supporting_refs"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").PatternStatus[];
        };
        readonly reason_codes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly supporting_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/override-pattern.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "status", "override_type", "supporting_refs"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lop_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").PatternStatus[];
        };
        readonly override_type: {
            readonly type: "string";
            readonly enum: import("../index.js").LearningFeedbackOverrideType[];
        };
        readonly supporting_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/editorial-feedback-signal.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "feedback_type", "decision_refs", "reason_codes", "notes", "created_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lfs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly feedback_type: {
            readonly type: "string";
            readonly enum: import("../index.js").FeedbackType[];
        };
        readonly decision_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly reason_codes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").FeedbackReasonCode[];
            };
        };
        readonly notes: {
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/reliability-learning-signal.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "release_impact", "safe_to_ignore", "ignored_ready", "active_pattern", "pattern_status", "occurrence_count", "evidence_refs", "created_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lrs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly release_impact: {
            readonly type: "string";
            readonly enum: import("../index.js").ReleaseImpact[];
        };
        readonly safe_to_ignore: {
            readonly type: "boolean";
        };
        readonly ignored_ready: {
            readonly type: "boolean";
        };
        readonly active_pattern: {
            readonly type: "boolean";
        };
        readonly pattern_status: {
            readonly type: "string";
            readonly enum: import("../index.js").PatternStatus[];
        };
        readonly occurrence_count: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly evidence_refs: {
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/learning-aggregation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "aggregation_status", "input_signal_refs", "aggregated_insight_refs", "generated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lag_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly aggregation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").AggregationStatus[];
        };
        readonly input_signal_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly aggregated_insight_refs: {
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
}, {
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
            readonly enum: import("../index.js").LearningInsightStatus[];
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
}, {
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
            readonly enum: import("../index.js").RecommendationStatus[];
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/learning-feedback/improvement-artifact.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "correlation_id", "artifact_type", "derived_from_refs", "safety_constraints", "rollout_notes", "created_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lia_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly artifact_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ImprovementArtifactType[];
        };
        readonly derived_from_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly safety_constraints: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly rollout_notes: {
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
}, {
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
            readonly enum: import("../index.js").LearningCompatibilityTarget[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").LearningCompatibilityStatus[];
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
                    readonly enum: import("../index.js").LearningCompatibilityStatus[];
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
}];
export { editorialFeedbackSignalSchema, reliabilityLearningSignalSchema, learningAggregationSchema, learningInsightSchema, learningRecommendationSchema, improvementArtifactSchema, learningCompatibilityResultSchema, feedbackSignalSchema, editorialFeedbackSchema, rejectionPatternSchema, overridePatternSchema, reliabilityFeedbackSchema, feedbackAggregationSchema, recommendationSetSchema, generatorImprovementArtifactSchema, };
export * from "./feedback-signal.schema.js";
export * from "./editorial-feedback.schema.js";
export * from "./rejection-pattern.schema.js";
export * from "./override-pattern.schema.js";
export * from "./reliability-feedback.schema.js";
export * from "./feedback-aggregation.schema.js";
export * from "./editorial-feedback-signal.schema.js";
export * from "./reliability-learning-signal.schema.js";
export * from "./learning-aggregation.schema.js";
export * from "./learning-insight.schema.js";
export * from "./recommendation-set.schema.js";
export * from "./learning-recommendation.schema.js";
export * from "./generator-improvement-artifact.schema.js";
export * from "./improvement-artifact.schema.js";
export * from "./learning-compatibility-result.schema.js";
//# sourceMappingURL=index.d.ts.map