import { PublishableCandidateStatus } from "../enums/publishable-candidate-status.enum.js";
export declare const PUBLISHABLE_CANDIDATE_SCHEMA_ID = "https://market-design-engine.dev/schemas/publishing/publishable-candidate.schema.json";
export declare const publishableCandidateSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/publishable-candidate.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_draft_pipeline_id", "title_set_id", "resolution_summary_id", "rulebook_compilation_id", "candidate_status", "structural_readiness_score", "blocking_issues", "warnings", "compatibility_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_draft_pipeline_id: {
            readonly type: "string";
            readonly pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly title_set_id: {
            readonly type: "string";
            readonly pattern: "^tset_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly resolution_summary_id: {
            readonly type: "string";
            readonly pattern: "^rsum_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly rulebook_compilation_id: {
            readonly type: "string";
            readonly pattern: "^rbcmp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly candidate_status: {
            readonly type: "string";
            readonly enum: PublishableCandidateStatus[];
        };
        readonly structural_readiness_score: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 100;
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
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
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
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
        readonly compatibility_metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
};
//# sourceMappingURL=publishable-candidate.schema.d.ts.map