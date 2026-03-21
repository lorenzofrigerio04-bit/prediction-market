import { PatternStatus } from "../enums/pattern-status.enum.js";
import { ReleaseImpact } from "../enums/release-impact.enum.js";
export declare const RELIABILITY_LEARNING_SIGNAL_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/reliability-learning-signal.schema.json";
export declare const reliabilityLearningSignalSchema: {
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
            readonly enum: ReleaseImpact[];
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
            readonly enum: PatternStatus[];
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
};
//# sourceMappingURL=reliability-learning-signal.schema.d.ts.map