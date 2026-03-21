import { RegressionStatus } from "../enums/regression-status.enum.js";
import { ReleaseReadinessStatus } from "../enums/release-readiness-status.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
import { MetricUnit } from "../enums/metric-unit.enum.js";
import { ThresholdStatus } from "../enums/threshold-status.enum.js";
export declare const PIPELINE_HEALTH_SNAPSHOT_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/pipeline-health-snapshot.schema.json";
export declare const pipelineHealthSnapshotSchema: {
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
                readonly enum: TargetModule[];
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
            readonly enum: RegressionStatus[];
        };
        readonly release_readiness_status: {
            readonly type: "string";
            readonly enum: ReleaseReadinessStatus[];
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
};
//# sourceMappingURL=pipeline-health-snapshot.schema.d.ts.map