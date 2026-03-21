import { MetricUnit } from "../enums/metric-unit.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
import { ThresholdStatus } from "../enums/threshold-status.enum.js";
export const MODULE_HEALTH_METRIC_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/module-health-metric.schema.json";
export const moduleHealthMetricSchema = {
    $id: MODULE_HEALTH_METRIC_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "module_name",
        "metric_name",
        "metric_value",
        "metric_unit",
        "measured_at",
        "threshold_status",
        "notes_nullable",
        "threshold_metadata_nullable",
    ],
    properties: {
        id: { type: "string", pattern: "^mhm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        module_name: { type: "string", enum: Object.values(TargetModule) },
        metric_name: { type: "string", minLength: 1 },
        metric_value: { type: "number" },
        metric_unit: { type: "string", enum: Object.values(MetricUnit) },
        measured_at: { type: "string", format: "date-time" },
        threshold_status: { type: "string", enum: Object.values(ThresholdStatus) },
        notes_nullable: { anyOf: [{ type: "null" }, { type: "string" }] },
        threshold_metadata_nullable: {
            anyOf: [
                { type: "null" },
                {
                    type: "object",
                    additionalProperties: false,
                    required: [
                        "threshold_min_nullable",
                        "threshold_max_nullable",
                        "threshold_target_nullable",
                    ],
                    properties: {
                        threshold_min_nullable: { anyOf: [{ type: "null" }, { type: "number" }] },
                        threshold_max_nullable: { anyOf: [{ type: "null" }, { type: "number" }] },
                        threshold_target_nullable: { anyOf: [{ type: "null" }, { type: "number" }] },
                    },
                },
            ],
        },
    },
};
//# sourceMappingURL=module-health-metric.schema.js.map