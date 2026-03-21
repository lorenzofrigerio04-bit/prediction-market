import { FeedbackReasonCode } from "../enums/feedback-reason-code.enum.js";
import { FeedbackType } from "../enums/feedback-type.enum.js";
export declare const EDITORIAL_FEEDBACK_SIGNAL_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/editorial-feedback-signal.schema.json";
export declare const editorialFeedbackSignalSchema: {
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
            readonly enum: FeedbackType[];
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
                readonly enum: FeedbackReasonCode[];
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
};
//# sourceMappingURL=editorial-feedback-signal.schema.d.ts.map