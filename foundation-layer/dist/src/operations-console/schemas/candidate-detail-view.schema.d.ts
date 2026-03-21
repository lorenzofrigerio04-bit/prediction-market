import { ActionKey } from "../enums/action-key.enum.js";
import { ArtifactType } from "../enums/artifact-type.enum.js";
import { ReadinessStatus } from "../enums/readiness-status.enum.js";
import { VisibilityStatus } from "../enums/visibility-status.enum.js";
export declare const CANDIDATE_DETAIL_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/candidate-detail-view.schema.json";
export declare const candidateDetailViewSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/candidate-detail-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "candidate_ref", "artifact_sections", "readiness_snapshot", "linked_audit_refs", "linked_review_refs", "linked_publication_refs", "visible_actions", "visibility_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^cdv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly candidate_ref: {
            readonly type: "string";
            readonly pattern: "^cdr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly artifact_sections: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["artifact_ref", "artifact_type", "section_title", "field_count"];
                readonly properties: {
                    readonly artifact_ref: {
                        readonly type: "string";
                        readonly pattern: "^arf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                    readonly artifact_type: {
                        readonly type: "string";
                        readonly enum: ArtifactType[];
                    };
                    readonly section_title: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly field_count: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
        };
        readonly readiness_snapshot: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["readiness_status", "blocking_issues", "warnings"];
            readonly properties: {
                readonly readiness_status: {
                    readonly type: "string";
                    readonly enum: ReadinessStatus[];
                };
                readonly blocking_issues: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly warnings: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly linked_audit_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^aud_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
            readonly uniqueItems: true;
        };
        readonly linked_review_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^rev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
            readonly uniqueItems: true;
        };
        readonly linked_publication_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^pub_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
            readonly uniqueItems: true;
        };
        readonly visible_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: ActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly visibility_status: {
            readonly type: "string";
            readonly enum: VisibilityStatus[];
        };
    };
};
//# sourceMappingURL=candidate-detail-view.schema.d.ts.map