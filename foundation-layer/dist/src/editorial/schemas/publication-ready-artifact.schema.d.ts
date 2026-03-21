import { FinalReadinessStatus } from "../enums/final-readiness-status.enum.js";
export declare const PUBLICATION_READY_ARTIFACT_SCHEMA_ID = "https://market-design-engine.dev/schemas/editorial/publication-ready-artifact.schema.json";
export declare const publicationReadyArtifactSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/publication-ready-artifact.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "final_readiness_status", "approved_artifacts", "gating_summary", "generated_at", "generated_by", "handoff_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^prad_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly final_readiness_status: {
            readonly type: "string";
            readonly enum: FinalReadinessStatus[];
        };
        readonly approved_artifacts: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^apd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
        };
        readonly gating_summary: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["readiness_status", "has_valid_approval", "has_terminal_rejection", "unresolved_blocking_flags_count", "checks"];
            readonly properties: {
                readonly readiness_status: {
                    readonly type: "string";
                    readonly enum: FinalReadinessStatus[];
                };
                readonly has_valid_approval: {
                    readonly type: "boolean";
                };
                readonly has_terminal_rejection: {
                    readonly type: "boolean";
                };
                readonly unresolved_blocking_flags_count: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly checks: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly generated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly generated_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly handoff_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
    };
};
//# sourceMappingURL=publication-ready-artifact.schema.d.ts.map