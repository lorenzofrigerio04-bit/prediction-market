import { actionSurfaceSchema } from "./action-surface.schema.js";
import { artifactInspectionViewSchema } from "./artifact-inspection-view.schema.js";
import { auditTimelineItemSchema } from "./audit-timeline-item.schema.js";
import { auditTimelineViewSchema } from "./audit-timeline-view.schema.js";
import { candidateDetailViewSchema } from "./candidate-detail-view.schema.js";
import { candidateListViewSchema } from "./candidate-list-view.schema.js";
import { consoleNavigationStateSchema } from "./console-navigation-state.schema.js";
import { permissionAwareViewStateSchema } from "./permission-aware-view-state.schema.js";
import { queueEntryViewSchema } from "./queue-entry-view.schema.js";
import { queuePanelViewSchema } from "./queue-panel-view.schema.js";
import { readinessPanelViewSchema } from "./readiness-panel-view.schema.js";
import { sharedConsoleSchema } from "./shared-console.schema.js";
export declare const operationsConsoleSchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/shared-console.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["version"];
    readonly properties: {
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly action_key: {
            readonly type: "string";
            readonly enum: import("../index.js").OperationsConsoleActionKey[];
        };
        readonly visibility_status: {
            readonly type: "string";
            readonly enum: import("../index.js").VisibilityStatus[];
        };
        readonly readiness_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ReadinessStatus[];
        };
        readonly panel_key: {
            readonly type: "string";
            readonly enum: import("../index.js").PanelKey[];
        };
        readonly filter_operator: {
            readonly type: "string";
            readonly enum: import("../index.js").FilterOperator[];
        };
        readonly sort_direction: {
            readonly type: "string";
            readonly enum: import("../index.js").SortDirection[];
        };
        readonly persisted_state_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").PersistedStatePolicy[];
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: import("../index.js").OperationsConsoleSeverityLevel[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/queue-entry-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["entry_ref", "entry_type", "display_title", "status", "priority", "created_at", "owner_nullable", "warnings", "available_actions"];
    readonly properties: {
        readonly entry_ref: {
            readonly type: "string";
            readonly pattern: "^qer_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly entry_type: {
            readonly type: "string";
            readonly enum: import("../index.js").EntryType[];
        };
        readonly display_title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly status: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly priority: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly owner_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly minLength: 1;
            }, {
                readonly type: "null";
            }];
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly available_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/queue-panel-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "panel_key", "queue_scope", "entries", "filters", "sort_config", "summary_counts", "visibility_rules"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^qpv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly panel_key: {
            readonly type: "string";
            readonly enum: import("../index.js").PanelKey[];
        };
        readonly queue_scope: {
            readonly type: "string";
            readonly enum: import("../index.js").QueueScope[];
        };
        readonly entries: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/operations-console/queue-entry-view.schema.json";
            };
        };
        readonly filters: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["field", "operator", "value"];
                readonly properties: {
                    readonly field: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly operator: {
                        readonly type: "string";
                        readonly enum: import("../index.js").FilterOperator[];
                    };
                    readonly value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly sort_config: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["sort_field", "sort_direction"];
            readonly properties: {
                readonly sort_field: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly sort_direction: {
                    readonly type: "string";
                    readonly enum: import("../index.js").SortDirection[];
                };
            };
        };
        readonly summary_counts: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["total", "ready", "blocked", "warnings"];
            readonly properties: {
                readonly total: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly ready: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly blocked: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly warnings: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
        readonly visibility_rules: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["permission_key", "expected_visibility"];
                readonly properties: {
                    readonly permission_key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly expected_visibility: {
                        readonly type: "string";
                        readonly enum: import("../index.js").VisibilityStatus[];
                    };
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/candidate-list-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "view_scope", "candidate_entries", "aggregate_counts", "applied_filters", "sort_config"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^clv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly view_scope: {
            readonly type: "string";
            readonly enum: import("../index.js").ViewScope[];
        };
        readonly candidate_entries: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["candidate_ref", "title", "readiness_status", "warnings_count"];
                readonly properties: {
                    readonly candidate_ref: {
                        readonly type: "string";
                        readonly pattern: "^cdr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                    readonly title: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly readiness_status: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ReadinessStatus[];
                    };
                    readonly warnings_count: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
        };
        readonly aggregate_counts: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "integer";
                readonly minimum: 0;
            };
        };
        readonly applied_filters: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["field", "operator", "value"];
                readonly properties: {
                    readonly field: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly operator: {
                        readonly type: "string";
                        readonly enum: import("../index.js").FilterOperator[];
                    };
                    readonly value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly sort_config: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["sort_field", "sort_direction"];
            readonly properties: {
                readonly sort_field: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly sort_direction: {
                    readonly type: "string";
                    readonly enum: import("../index.js").SortDirection[];
                };
            };
        };
    };
}, {
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
                        readonly enum: import("../index.js").ArtifactType[];
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
                    readonly enum: import("../index.js").ReadinessStatus[];
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
                readonly enum: import("../index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly visibility_status: {
            readonly type: "string";
            readonly enum: import("../index.js").VisibilityStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/artifact-inspection-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "artifact_ref", "artifact_type", "structured_fields", "validation_snapshot", "compatibility_snapshot", "related_refs"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^aiv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly artifact_ref: {
            readonly type: "string";
            readonly pattern: "^arf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly artifact_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ArtifactType[];
        };
        readonly structured_fields: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["key", "value_type", "value_summary"];
                readonly properties: {
                    readonly key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value_type: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value_summary: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly validation_snapshot: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["is_valid", "issue_count", "blocking_issue_count"];
            readonly properties: {
                readonly is_valid: {
                    readonly type: "boolean";
                };
                readonly issue_count: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly blocking_issue_count: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
        readonly compatibility_snapshot: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["is_compatible", "incompatible_with", "lossy_fields"];
            readonly properties: {
                readonly is_compatible: {
                    readonly type: "boolean";
                };
                readonly incompatible_with: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly lossy_fields: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
            };
        };
        readonly related_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/audit-timeline-item.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["item_ref", "timestamp", "actor_ref", "action_type", "summary", "severity", "linked_entity_refs"];
    readonly properties: {
        readonly item_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly timestamp: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly actor_ref: {
            readonly type: "string";
            readonly pattern: "^act_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly action_type: {
            readonly type: "string";
            readonly enum: import("../index.js").TimelineActionType[];
        };
        readonly summary: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: import("../index.js").OperationsConsoleSeverityLevel[];
        };
        readonly linked_entity_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/audit-timeline-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_ref", "timeline_items", "correlation_groups", "filter_state", "visibility_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^atv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly timeline_items: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/operations-console/audit-timeline-item.schema.json";
            };
        };
        readonly correlation_groups: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["group_ref", "item_refs"];
                readonly properties: {
                    readonly group_ref: {
                        readonly type: "string";
                        readonly pattern: "^cgr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                    readonly item_refs: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                        readonly uniqueItems: true;
                    };
                };
            };
        };
        readonly filter_state: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["actor_refs", "action_types", "severity_levels"];
            readonly properties: {
                readonly actor_refs: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly action_types: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly severity_levels: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
            };
        };
        readonly visibility_status: {
            readonly type: "string";
            readonly enum: import("../index.js").VisibilityStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/readiness-panel-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_ref", "readiness_status", "gating_items", "blocking_issues", "warnings", "recommended_next_actions"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rpv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly readiness_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ReadinessStatus[];
        };
        readonly gating_items: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["key", "satisfied", "reason_nullable"];
                readonly properties: {
                    readonly key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly satisfied: {
                        readonly type: "boolean";
                    };
                    readonly reason_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "string";
                            readonly minLength: 1;
                        }, {
                            readonly type: "null";
                        }];
                    };
                };
            };
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
        readonly recommended_next_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["action_key", "reason"];
                readonly properties: {
                    readonly action_key: {
                        readonly type: "string";
                        readonly enum: import("../index.js").OperationsConsoleActionKey[];
                    };
                    readonly reason: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/action-surface.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_ref", "available_action_keys", "hidden_action_keys", "disabled_action_keys", "action_constraints", "permission_basis"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^asf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly available_action_keys: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly hidden_action_keys: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly disabled_action_keys: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly action_constraints: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["constraint_ref", "description", "is_blocking"];
                readonly properties: {
                    readonly constraint_ref: {
                        readonly type: "string";
                        readonly pattern: "^acr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly is_blocking: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly permission_basis: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["roles", "explicit_allow_actions", "explicit_deny_actions", "deny_first"];
            readonly properties: {
                readonly roles: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly explicit_allow_actions: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly enum: import("../index.js").OperationsConsoleActionKey[];
                    };
                    readonly uniqueItems: true;
                };
                readonly explicit_deny_actions: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly enum: import("../index.js").OperationsConsoleActionKey[];
                    };
                    readonly uniqueItems: true;
                };
                readonly deny_first: {
                    readonly type: "boolean";
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/console-navigation-state.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "active_panel", "active_filters", "selected_entity_ref_nullable", "breadcrumb_state", "user_scope", "persisted_state_policy"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^cns_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly active_panel: {
            readonly type: "string";
            readonly enum: import("../index.js").PanelKey[];
        };
        readonly active_filters: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["filters"];
            readonly properties: {
                readonly filters: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["field", "operator", "value"];
                        readonly properties: {
                            readonly field: {
                                readonly type: "string";
                                readonly minLength: 1;
                            };
                            readonly operator: {
                                readonly type: "string";
                                readonly enum: import("../index.js").FilterOperator[];
                            };
                            readonly value: {
                                readonly type: "string";
                                readonly minLength: 1;
                            };
                        };
                    };
                };
            };
        };
        readonly selected_entity_ref_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly minLength: 1;
            }, {
                readonly type: "null";
            }];
        };
        readonly breadcrumb_state: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["items"];
            readonly properties: {
                readonly items: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly user_scope: {
            readonly type: "string";
            readonly enum: import("../index.js").ViewScope[];
        };
        readonly persisted_state_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").PersistedStatePolicy[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/permission-aware-view-state.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "user_id", "workspace_id_nullable", "target_view_key", "visibility_status", "allowed_actions", "denied_actions", "evaluation_basis"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^pvs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly user_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly workspace_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly minLength: 1;
            }, {
                readonly type: "null";
            }];
        };
        readonly target_view_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly visibility_status: {
            readonly type: "string";
            readonly enum: import("../index.js").VisibilityStatus[];
        };
        readonly allowed_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly denied_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").OperationsConsoleActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly evaluation_basis: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["source_module", "evaluated_roles", "matched_rules", "deny_reasons"];
            readonly properties: {
                readonly source_module: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly evaluated_roles: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly matched_rules: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly deny_reasons: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
            };
        };
    };
}];
export { actionSurfaceSchema, artifactInspectionViewSchema, auditTimelineItemSchema, auditTimelineViewSchema, candidateDetailViewSchema, candidateListViewSchema, consoleNavigationStateSchema, permissionAwareViewStateSchema, queueEntryViewSchema, queuePanelViewSchema, readinessPanelViewSchema, sharedConsoleSchema, };
export * from "./action-surface.schema.js";
export * from "./artifact-inspection-view.schema.js";
export * from "./audit-timeline-item.schema.js";
export * from "./audit-timeline-view.schema.js";
export * from "./candidate-detail-view.schema.js";
export * from "./candidate-list-view.schema.js";
export * from "./console-navigation-state.schema.js";
export * from "./permission-aware-view-state.schema.js";
export * from "./queue-entry-view.schema.js";
export * from "./queue-panel-view.schema.js";
export * from "./readiness-panel-view.schema.js";
export * from "./shared-console.schema.js";
//# sourceMappingURL=index.d.ts.map