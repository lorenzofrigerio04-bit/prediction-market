import { publicationArtifactSchema } from "./publication-artifact.schema.js";
import { publicationPackageSchema } from "./publication-package.schema.js";
import { publicationHandoffSchema } from "./publication-handoff.schema.js";
import { schedulingWindowSchema } from "./scheduling-window.schema.js";
import { schedulingCandidateSchema } from "./scheduling-candidate.schema.js";
import { publicationMetadataSchema } from "./publication-metadata.schema.js";
import { livePublicationContractSchema } from "./live-publication-contract.schema.js";
import { deliveryReadinessReportSchema } from "./delivery-readiness-report.schema.js";
export declare const liveIntegrationSchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/publication-artifact.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["artifact_type", "artifact_ref", "integrity_hash", "required"];
    readonly properties: {
        readonly artifact_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ArtifactType[];
        };
        readonly artifact_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly integrity_hash: {
            readonly type: "string";
            readonly pattern: "^([a-fA-F0-9]{64}|sha256:[a-fA-F0-9]{64})$";
        };
        readonly required: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/publication-package.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publication_ready_artifact_id", "packaged_artifacts", "package_metadata", "package_status", "created_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v?[0-9]+\\.[0-9]+\\.[0-9]+$";
        };
        readonly publication_ready_artifact_id: {
            readonly type: "string";
            readonly pattern: "^prad_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly packaged_artifacts: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["artifact_type", "artifact_ref", "integrity_hash", "required"];
                readonly properties: {
                    readonly artifact_type: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ArtifactType[];
                    };
                    readonly artifact_ref: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly integrity_hash: {
                        readonly type: "string";
                        readonly pattern: "^([a-fA-F0-9]{64}|sha256:[a-fA-F0-9]{64})$";
                    };
                    readonly required: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly package_metadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["category", "tags", "jurisdiction", "display_priority", "market_visibility", "compliance_flags"];
            readonly properties: {
                readonly category: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly tags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly jurisdiction: {
                    readonly type: "string";
                    readonly pattern: "^[A-Z]{2,3}$";
                };
                readonly display_priority: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly market_visibility: {
                    readonly type: "string";
                    readonly enum: import("../index.js").MarketVisibility[];
                };
                readonly compliance_flags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ComplianceFlag[];
                    };
                };
            };
        };
        readonly package_status: {
            readonly type: "string";
            readonly enum: import("../index.js").PackageStatus[];
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/publication-handoff.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publication_package_id", "handoff_status", "initiated_by", "initiated_at", "delivery_notes", "audit_ref"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^phnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v?[0-9]+\\.[0-9]+\\.[0-9]+$";
        };
        readonly publication_package_id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly handoff_status: {
            readonly type: "string";
            readonly enum: import("../index.js").HandoffStatus[];
        };
        readonly initiated_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly initiated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly delivery_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly pattern: "^aref_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/scheduling-window.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["start_at", "end_at"];
    readonly properties: {
        readonly start_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly end_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/scheduling-candidate.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "publication_package_id", "scheduling_window", "priority_level", "scheduling_notes", "scheduling_status", "readiness_status", "delivery_readiness_report_id", "blocking_issues_snapshot"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^scnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly publication_package_id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly scheduling_window: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["start_at", "end_at"];
            readonly properties: {
                readonly start_at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly end_at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
            };
        };
        readonly priority_level: {
            readonly type: "string";
            readonly enum: import("../../index.js").EventPriority[];
        };
        readonly scheduling_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly scheduling_status: {
            readonly type: "string";
            readonly enum: import("../index.js").SchedulingStatus[];
        };
        readonly readiness_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ReadinessStatus[];
        };
        readonly delivery_readiness_report_id: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly pattern: "^drrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }, {
                readonly type: "null";
            }];
        };
        readonly blocking_issues_snapshot: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/publication-metadata.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["category", "tags", "jurisdiction", "display_priority", "market_visibility", "compliance_flags"];
    readonly properties: {
        readonly category: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly jurisdiction: {
            readonly type: "string";
            readonly pattern: "^[A-Z]{2,3}$";
        };
        readonly display_priority: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly market_visibility: {
            readonly type: "string";
            readonly enum: import("../index.js").MarketVisibility[];
        };
        readonly compliance_flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").ComplianceFlag[];
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/live-publication-contract.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publication_package_id", "canonical_contract_ref", "publication_metadata", "activation_policy", "safety_checks", "contract_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^lpct_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v?[0-9]+\\.[0-9]+\\.[0-9]+$";
        };
        readonly publication_package_id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_contract_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly publication_metadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["category", "tags", "jurisdiction", "display_priority", "market_visibility", "compliance_flags"];
            readonly properties: {
                readonly category: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly tags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly jurisdiction: {
                    readonly type: "string";
                    readonly pattern: "^[A-Z]{2,3}$";
                };
                readonly display_priority: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly market_visibility: {
                    readonly type: "string";
                    readonly enum: import("../index.js").MarketVisibility[];
                };
                readonly compliance_flags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly enum: import("../index.js").ComplianceFlag[];
                    };
                };
            };
        };
        readonly activation_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").ActivationPolicy[];
        };
        readonly safety_checks: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly contract_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ContractStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/delivery-readiness-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "publication_package_id", "readiness_status", "blocking_issues", "warnings", "validated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^drrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly publication_package_id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
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
        readonly validated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}];
export { publicationArtifactSchema, publicationPackageSchema, publicationHandoffSchema, schedulingWindowSchema, schedulingCandidateSchema, publicationMetadataSchema, livePublicationContractSchema, deliveryReadinessReportSchema, };
export * from "./publication-artifact.schema.js";
export * from "./publication-package.schema.js";
export * from "./publication-handoff.schema.js";
export * from "./scheduling-window.schema.js";
export * from "./scheduling-candidate.schema.js";
export * from "./publication-metadata.schema.js";
export * from "./live-publication-contract.schema.js";
export * from "./delivery-readiness-report.schema.js";
//# sourceMappingURL=index.d.ts.map