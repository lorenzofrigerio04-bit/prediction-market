import { reviewQueueEntrySchema } from "./review-queue-entry.schema.js";
import { editorialReviewSchema } from "./editorial-review.schema.js";
import { approvalDecisionSchema } from "./approval-decision.schema.js";
import { rejectionDecisionSchema } from "./rejection-decision.schema.js";
import { manualOverrideSchema } from "./manual-override.schema.js";
import { auditRecordSchema } from "./audit-record.schema.js";
import { revisionRecordSchema } from "./revision-record.schema.js";
import { publicationReadyArtifactSchema } from "./publication-ready-artifact.schema.js";
import { controlledStateTransitionSchema } from "./controlled-state-transition.schema.js";
export declare const editorialSchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/editorial/review-queue-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "queue_status", "priority_level", "entered_queue_at", "assigned_reviewer_nullable", "queue_reason", "blocking_flags", "warnings"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rqe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly queue_status: {
            readonly type: "string";
            readonly enum: import("../index.js").QueueStatus[];
        };
        readonly priority_level: {
            readonly type: "string";
            readonly enum: import("../index.js").PriorityLevel[];
        };
        readonly entered_queue_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly assigned_reviewer_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly queue_reason: {
            readonly type: "string";
            readonly enum: import("../index.js").ReasonCode[];
        };
        readonly blocking_flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path", "is_resolved"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ReasonCode[];
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly is_resolved: {
                        readonly type: "boolean";
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
                        readonly enum: import("../index.js").ReasonCode[];
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
    };
}, {
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
            readonly enum: import("../index.js").ReviewStatus[];
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
                        readonly enum: import("../index.js").ReasonCode[];
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
                        readonly enum: import("../index.js").ReasonCode[];
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/approval-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "approved_by", "approved_at", "approval_scope", "approval_notes_nullable", "publication_readiness_score"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^apd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly approved_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly approved_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly approval_scope: {
            readonly type: "string";
            readonly enum: import("../index.js").ApprovalScope[];
        };
        readonly approval_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly publication_readiness_score: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 100;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/rejection-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "rejected_by", "rejected_at", "rejection_reason_codes", "rejection_notes_nullable", "rework_required"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rjd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly rejected_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly rejected_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly rejection_reason_codes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").ReasonCode[];
            };
        };
        readonly rejection_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly rework_required: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/manual-override.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_entity_type", "target_entity_id", "override_type", "initiated_by", "initiated_at", "override_reason", "override_scope", "expiration_nullable", "audit_reference_id"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ovr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly target_entity_type: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_entity_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly override_type: {
            readonly type: "string";
            readonly enum: import("../index.js").OverrideType[];
        };
        readonly initiated_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly initiated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly override_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly override_scope: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["affected_fields", "allow_readiness_gate_bypass"];
            readonly properties: {
                readonly affected_fields: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly allow_readiness_gate_bypass: {
                    readonly type: "boolean";
                };
            };
        };
        readonly expiration_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly format: "date-time";
            }, {
                readonly type: "null";
            }];
        };
        readonly audit_reference_id: {
            readonly type: "string";
            readonly pattern: "^aref_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/audit-record.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "actor_id", "action_type", "target_type", "target_id", "action_timestamp", "action_payload_summary", "reason_codes", "correlation_id"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^aud_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly actor_id: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly action_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ActionType[];
        };
        readonly target_type: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly action_timestamp: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly action_payload_summary: {
            readonly type: "string";
            readonly minLength: 8;
        };
        readonly reason_codes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").ReasonCode[];
            };
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/revision-record.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_entity_type", "target_entity_id", "revision_number", "changed_fields", "changed_by", "changed_at", "revision_reason"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly target_entity_type: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_entity_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly revision_number: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly changed_fields: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["field_path", "previous_value_summary", "new_value_summary"];
                readonly properties: {
                    readonly field_path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly previous_value_summary: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly new_value_summary: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly changed_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly changed_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly revision_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
}, {
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
            readonly enum: import("../index.js").FinalReadinessStatus[];
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
                    readonly enum: import("../index.js").FinalReadinessStatus[];
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/controlled-state-transition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "from_state", "to_state", "transition_at", "transitioned_by", "transition_reason", "audit_record_id"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ctr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly from_state: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly to_state: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly transition_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly transitioned_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly transition_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly audit_record_id: {
            readonly type: "string";
            readonly pattern: "^aud_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
}];
export { reviewQueueEntrySchema, editorialReviewSchema, approvalDecisionSchema, rejectionDecisionSchema, manualOverrideSchema, auditRecordSchema, revisionRecordSchema, publicationReadyArtifactSchema, controlledStateTransitionSchema, };
//# sourceMappingURL=index.d.ts.map