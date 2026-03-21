import { adversarialCaseSchema } from "./adversarial-case.schema.js";
import { goldenDatasetEntrySchema } from "./golden-dataset-entry.schema.js";
import { moduleHealthMetricSchema } from "./module-health-metric.schema.js";
import { observabilityEventSchema } from "./observability-event.schema.js";
import { pipelineHealthSnapshotSchema } from "./pipeline-health-snapshot.schema.js";
import { qualityReportSchema } from "./quality-report.schema.js";
import { regressionCaseSchema } from "./regression-case.schema.js";
import { releaseGateEvaluationSchema } from "./release-gate-evaluation.schema.js";
export declare const reliabilitySchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/reliability/golden-dataset-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "dataset_scope", "input_artifact_refs", "expected_output_refs", "expected_invariants", "category_tags", "priority_level", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^gde_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly dataset_scope: {
            readonly type: "string";
            readonly enum: import("../index.js").DatasetScope[];
        };
        readonly input_artifact_refs: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/artifactReference";
            };
        };
        readonly expected_output_refs: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/artifactReference";
            };
        };
        readonly expected_invariants: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "#/$defs/expectedInvariant";
            };
        };
        readonly category_tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly priority_level: {
            readonly type: "string";
            readonly enum: import("../index.js").PriorityLevel[];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
    readonly $defs: {
        readonly artifactReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["module_name", "artifact_type", "artifact_id", "artifact_version_nullable", "uri_nullable"];
            readonly properties: {
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../index.js").TargetModule[];
                };
                readonly artifact_type: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_version_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "integer";
                        readonly minimum: 1;
                    }];
                };
                readonly uri_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly minLength: 1;
                    }];
                };
            };
        };
        readonly expectedInvariant: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "description", "path"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly description: {
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/regression-case.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "case_name", "target_module", "input_refs", "expected_behavior", "failure_signature_nullable", "severity", "linked_dataset_entry_id_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rgc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly case_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_module: {
            readonly type: "string";
            readonly enum: import("../index.js").TargetModule[];
        };
        readonly input_refs: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/artifactReference";
            };
        };
        readonly expected_behavior: {
            readonly type: "string";
        };
        readonly failure_signature_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
            }];
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: import("../index.js").SeverityLevel[];
        };
        readonly linked_dataset_entry_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^gde_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
    };
    readonly $defs: {
        readonly artifactReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["module_name", "artifact_type", "artifact_id", "artifact_version_nullable", "uri_nullable"];
            readonly properties: {
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../index.js").TargetModule[];
                };
                readonly artifact_type: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_version_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "integer";
                        readonly minimum: 1;
                    }];
                };
                readonly uri_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly minLength: 1;
                    }];
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/adversarial-case.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_module", "adversarial_type", "crafted_input_refs", "expected_rejection_or_behavior", "risk_level", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^adv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly target_module: {
            readonly type: "string";
            readonly enum: import("../index.js").TargetModule[];
        };
        readonly adversarial_type: {
            readonly type: "string";
            readonly enum: import("../index.js").AdversarialType[];
        };
        readonly crafted_input_refs: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/artifactReference";
            };
        };
        readonly expected_rejection_or_behavior: {
            readonly type: "string";
        };
        readonly risk_level: {
            readonly type: "string";
            readonly enum: import("../index.js").RiskLevel[];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
    readonly $defs: {
        readonly artifactReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["module_name", "artifact_type", "artifact_id", "artifact_version_nullable", "uri_nullable"];
            readonly properties: {
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../index.js").TargetModule[];
                };
                readonly artifact_type: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_version_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "integer";
                        readonly minimum: 1;
                    }];
                };
                readonly uri_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly minLength: 1;
                    }];
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/module-health-metric.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "module_name", "metric_name", "metric_value", "metric_unit", "measured_at", "threshold_status", "notes_nullable", "threshold_metadata_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mhm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly module_name: {
            readonly type: "string";
            readonly enum: import("../index.js").TargetModule[];
        };
        readonly metric_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly metric_value: {
            readonly type: "number";
        };
        readonly metric_unit: {
            readonly type: "string";
            readonly enum: import("../index.js").MetricUnit[];
        };
        readonly measured_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly threshold_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ThresholdStatus[];
        };
        readonly notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
            }];
        };
        readonly threshold_metadata_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["threshold_min_nullable", "threshold_max_nullable", "threshold_target_nullable"];
                readonly properties: {
                    readonly threshold_min_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "number";
                        }];
                    };
                    readonly threshold_max_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "number";
                        }];
                    };
                    readonly threshold_target_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "number";
                        }];
                    };
                };
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/pipeline-health-snapshot.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "snapshot_at", "covered_modules", "module_metrics", "pass_rate", "regression_status", "release_readiness_status", "blocking_issues", "warnings"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^phs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly snapshot_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly covered_modules: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly enum: import("../index.js").TargetModule[];
            };
        };
        readonly module_metrics: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/moduleHealthMetric";
            };
        };
        readonly pass_rate: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
        readonly regression_status: {
            readonly type: "string";
            readonly enum: import("../index.js").RegressionStatus[];
        };
        readonly release_readiness_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ReleaseReadinessStatus[];
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/blockingReason";
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/warningMessage";
            };
        };
    };
    readonly $defs: {
        readonly moduleHealthMetric: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["id", "module_name", "metric_name", "metric_value", "metric_unit", "measured_at", "threshold_status", "notes_nullable", "threshold_metadata_nullable"];
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly pattern: "^mhm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                };
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../index.js").TargetModule[];
                };
                readonly metric_name: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly metric_value: {
                    readonly type: "number";
                };
                readonly metric_unit: {
                    readonly type: "string";
                    readonly enum: import("../index.js").MetricUnit[];
                };
                readonly measured_at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly threshold_status: {
                    readonly type: "string";
                    readonly enum: import("../index.js").ThresholdStatus[];
                };
                readonly notes_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                    }];
                };
                readonly threshold_metadata_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["threshold_min_nullable", "threshold_max_nullable", "threshold_target_nullable"];
                        readonly properties: {
                            readonly threshold_min_nullable: {
                                readonly anyOf: readonly [{
                                    readonly type: "null";
                                }, {
                                    readonly type: "number";
                                }];
                            };
                            readonly threshold_max_nullable: {
                                readonly anyOf: readonly [{
                                    readonly type: "null";
                                }, {
                                    readonly type: "number";
                                }];
                            };
                            readonly threshold_target_nullable: {
                                readonly anyOf: readonly [{
                                    readonly type: "null";
                                }, {
                                    readonly type: "number";
                                }];
                            };
                        };
                    }];
                };
            };
        };
        readonly blockingReason: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "message", "module_name", "path"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly message: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../index.js").TargetModule[];
                };
                readonly path: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly warningMessage: {
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/release-gate-evaluation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "evaluated_at", "target_scope", "schema_gate_pass", "validator_gate_pass", "test_gate_pass", "regression_gate_pass", "compatibility_gate_pass", "readiness_gate_pass", "final_gate_status", "blocking_reasons"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rge_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly evaluated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly target_scope: {
            readonly type: "string";
            readonly enum: import("../index.js").DatasetScope[];
        };
        readonly schema_gate_pass: {
            readonly type: "boolean";
        };
        readonly validator_gate_pass: {
            readonly type: "boolean";
        };
        readonly test_gate_pass: {
            readonly type: "boolean";
        };
        readonly regression_gate_pass: {
            readonly type: "boolean";
        };
        readonly compatibility_gate_pass: {
            readonly type: "boolean";
        };
        readonly readiness_gate_pass: {
            readonly type: "boolean";
        };
        readonly final_gate_status: {
            readonly type: "string";
            readonly enum: import("../index.js").FinalGateStatus[];
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/blockingReason";
            };
        };
    };
    readonly $defs: {
        readonly blockingReason: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "message", "module_name", "path"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly message: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../index.js").TargetModule[];
                };
                readonly path: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/quality-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "report_scope", "generated_at", "summary", "key_findings", "metrics_summary", "unresolved_issues", "recommendations"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^qrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly report_scope: {
            readonly type: "string";
            readonly enum: import("../index.js").ReportScope[];
        };
        readonly generated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly summary: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly key_findings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly metrics_summary: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/moduleHealthMetric";
            };
        };
        readonly unresolved_issues: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/blockingReason";
            };
        };
        readonly recommendations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
    readonly $defs: {
        readonly moduleHealthMetric: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["id", "module_name", "metric_name", "metric_value", "metric_unit", "measured_at", "threshold_status", "notes_nullable", "threshold_metadata_nullable"];
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly pattern: "^mhm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                };
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../index.js").TargetModule[];
                };
                readonly metric_name: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly metric_value: {
                    readonly type: "number";
                };
                readonly metric_unit: {
                    readonly type: "string";
                    readonly enum: import("../index.js").MetricUnit[];
                };
                readonly measured_at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly threshold_status: {
                    readonly type: "string";
                    readonly enum: import("../index.js").ThresholdStatus[];
                };
                readonly notes_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                    }];
                };
                readonly threshold_metadata_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["threshold_min_nullable", "threshold_max_nullable", "threshold_target_nullable"];
                        readonly properties: {
                            readonly threshold_min_nullable: {
                                readonly anyOf: readonly [{
                                    readonly type: "null";
                                }, {
                                    readonly type: "number";
                                }];
                            };
                            readonly threshold_max_nullable: {
                                readonly anyOf: readonly [{
                                    readonly type: "null";
                                }, {
                                    readonly type: "number";
                                }];
                            };
                            readonly threshold_target_nullable: {
                                readonly anyOf: readonly [{
                                    readonly type: "null";
                                }, {
                                    readonly type: "number";
                                }];
                            };
                        };
                    }];
                };
            };
        };
        readonly blockingReason: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "message", "module_name", "path"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly message: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: import("../index.js").TargetModule[];
                };
                readonly path: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/observability-event.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "event_type", "module_name", "correlation_id", "emitted_at", "severity", "payload_summary", "trace_refs", "diagnostic_tags"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^obe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly event_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ObservabilityEventType[];
        };
        readonly module_name: {
            readonly type: "string";
            readonly enum: import("../index.js").TargetModule[];
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly emitted_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: import("../index.js").SeverityLevel[];
        };
        readonly payload_summary: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["summary_type", "values"];
            readonly properties: {
                readonly summary_type: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly values: {
                    readonly type: "object";
                    readonly additionalProperties: {
                        readonly anyOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "number";
                        }, {
                            readonly type: "boolean";
                        }, {
                            readonly type: "null";
                        }];
                    };
                };
            };
        };
        readonly trace_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["trace_id", "span_id_nullable", "parent_trace_id_nullable"];
                readonly properties: {
                    readonly trace_id: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly span_id_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly minLength: 1;
                        }];
                    };
                    readonly parent_trace_id_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly minLength: 1;
                        }];
                    };
                };
            };
        };
        readonly diagnostic_tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}];
export { goldenDatasetEntrySchema, regressionCaseSchema, adversarialCaseSchema, moduleHealthMetricSchema, pipelineHealthSnapshotSchema, releaseGateEvaluationSchema, qualityReportSchema, observabilityEventSchema, };
//# sourceMappingURL=index.d.ts.map