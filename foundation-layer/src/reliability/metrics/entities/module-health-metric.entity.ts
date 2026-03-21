import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { MetricUnit } from "../../enums/metric-unit.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import { ThresholdStatus } from "../../enums/threshold-status.enum.js";
import type { MetricThresholdMetadata } from "../../value-objects/metric-threshold-metadata.vo.js";
import { createMetricThresholdMetadata } from "../../value-objects/metric-threshold-metadata.vo.js";
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

export const createModuleHealthMetric = (input: ModuleHealthMetric): ModuleHealthMetric => {
  if (!Object.values(TargetModule).includes(input.module_name)) {
    throw new ValidationError("INVALID_MODULE_HEALTH_METRIC", "module_name is invalid");
  }
  if (!Object.values(MetricUnit).includes(input.metric_unit)) {
    throw new ValidationError("INVALID_MODULE_HEALTH_METRIC", "metric_unit is invalid");
  }
  if (!Object.values(ThresholdStatus).includes(input.threshold_status)) {
    throw new ValidationError("INVALID_MODULE_HEALTH_METRIC", "threshold_status is invalid");
  }
  if (input.metric_name.trim().length === 0) {
    throw new ValidationError("INVALID_MODULE_HEALTH_METRIC", "metric_name must not be empty");
  }
  if (!Number.isFinite(input.metric_value)) {
    throw new ValidationError("INVALID_MODULE_HEALTH_METRIC", "metric_value must be a finite number");
  }
  return deepFreeze({
    ...input,
    metric_name: input.metric_name.trim(),
    notes_nullable: input.notes_nullable === null ? null : input.notes_nullable.trim(),
    threshold_metadata_nullable:
      input.threshold_metadata_nullable === null
        ? null
        : createMetricThresholdMetadata(input.threshold_metadata_nullable),
  });
};
