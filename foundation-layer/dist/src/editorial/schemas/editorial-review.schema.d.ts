import { ReviewStatus } from "../enums/review-status.enum.js";
import { ReasonCode } from "../enums/reason-code.enum.js";
export declare const EDITORIAL_REVIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/editorial/editorial-review.schema.json";
export declare const editorialReviewSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/editorial-review.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "review_status", "reviewer_id", "reviewed_at", "findings", "required_actions", "review_notes_nullable", "severity_summary"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^edrev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly review_status: {
            readonly type: "string";
            readonly enum: ReviewStatus[];
        };
        readonly reviewer_id: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly reviewed_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly findings: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "severity", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly enum: ReasonCode[];
                    };
                    readonly severity: {
                        readonly type: "string";
                        readonly enum: readonly ["low", "medium", "high", "critical"];
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly required_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "description", "owner", "is_mandatory"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly enum: ReasonCode[];
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly owner: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly is_mandatory: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly review_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly severity_summary: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["low", "medium", "high", "critical", "highest_severity", "total_findings"];
            readonly properties: {
                readonly low: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly medium: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly high: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly critical: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly highest_severity: {
                    readonly type: "string";
                    readonly enum: readonly ["low", "medium", "high", "critical"];
                };
                readonly total_findings: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
    };
};
//# sourceMappingURL=editorial-review.schema.d.ts.map