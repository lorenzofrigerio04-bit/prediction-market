import { MetricUnit } from "../enums/metric-unit.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
import { ThresholdStatus } from "../enums/threshold-status.enum.js";
export declare const MODULE_HEALTH_METRIC_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/module-health-metric.schema.json";
export declare const moduleHealthMetricSchema: {
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
//# sourceMappingURL=module-health-metric.schema.d.ts.map