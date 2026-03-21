import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { createModuleHealthMetric } from "../entities/module-health-metric.entity.js";
import { MetricUnit } from "../../enums/metric-unit.enum.js";
import { ThresholdStatus } from "../../enums/threshold-status.enum.js";
import { createModuleHealthMetricId } from "../../value-objects/reliability-ids.vo.js";
const deriveThresholdStatus = (value) => {
    if (value >= 0.9) {
        return ThresholdStatus.HEALTHY;
    }
    if (value >= 0.75) {
        return ThresholdStatus.WARNING;
    }
    return ThresholdStatus.BREACHED;
};
export class DeterministicModuleHealthEvaluator {
    evaluate(moduleName, metrics) {
        return metrics.map((metric, index) => createModuleHealthMetric({
            id: createModuleHealthMetricId(`mhm_evalmetric${String(index).padStart(2, "0")}`),
            module_name: moduleName,
            metric_name: metric.metric_name,
            metric_value: metric.metric_value,
            metric_unit: MetricUnit.RATIO,
            measured_at: createTimestamp("1970-01-01T00:00:00.000Z"),
            threshold_status: deriveThresholdStatus(metric.metric_value),
            notes_nullable: null,
            threshold_metadata_nullable: {
                threshold_min_nullable: 0.75,
                threshold_max_nullable: 1,
                threshold_target_nullable: 0.9,
            },
        }));
    }
}
//# sourceMappingURL=deterministic-module-health-evaluator.js.map