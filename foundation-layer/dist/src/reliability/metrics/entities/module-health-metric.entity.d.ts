import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { MetricUnit } from "../../enums/metric-unit.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import { ThresholdStatus } from "../../enums/threshold-status.enum.js";
import type { MetricThresholdMetadata } from "../../value-objects/metric-threshold-metadata.vo.js";
import type { ModuleHealthMetricId } from "../../value-objects/reliability-ids.vo.js";
export type ModuleHealthMetric = Readonly<{
    id: ModuleHealthMetricId;
    module_name: TargetModule;
    metric_name: string;
    metric_value: number;
    metric_unit: MetricUnit;
    measured_at: Timestamp;
    threshold_status: ThresholdStatus;
    notes_nullable: string | null;
    threshold_metadata_nullable: MetricThresholdMetadata | null;
}>;
export declare const createModuleHealthMetric: (input: ModuleHealthMetric) => ModuleHealthMetric;
//# sourceMappingURL=module-health-metric.entity.d.ts.map