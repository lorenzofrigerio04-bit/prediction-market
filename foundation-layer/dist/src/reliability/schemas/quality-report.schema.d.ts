import { ReportScope } from "../enums/report-scope.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
import { MetricUnit } from "../enums/metric-unit.enum.js";
import { ThresholdStatus } from "../enums/threshold-status.enum.js";
export declare const QUALITY_REPORT_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/quality-report.schema.json";
export declare const qualityReportSchema: {
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
            readonly enum: ReportScope[];
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
                    readonly enum: TargetModule[];
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
                    readonly enum: MetricUnit[];
                };
                readonly measured_at: {
                    readonly type: "string";
                    readonly format: "date-time";
                };
                readonly threshold_status: {
                    readonly type: "string";
                    readonly enum: ThresholdStatus[];
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
                    readonly enum: TargetModule[];
                };
                readonly path: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
    };
};
//# sourceMappingURL=quality-report.schema.d.ts.map