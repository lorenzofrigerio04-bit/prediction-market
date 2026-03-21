import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { RegressionStatus } from "../../enums/regression-status.enum.js";
import { ReleaseReadinessStatus } from "../../enums/release-readiness-status.enum.js";
import type { TargetModule } from "../../enums/target-module.enum.js";
import type { ModuleHealthMetric } from "../../metrics/entities/module-health-metric.entity.js";
import { createPassRate, type PassRate } from "../../value-objects/pass-rate.vo.js";
import type { PipelineHealthSnapshotId } from "../../value-objects/reliability-ids.vo.js";
import type { BlockingReason } from "../../value-objects/blocking-reason.vo.js";
import { createBlockingReasonCollection } from "../../value-objects/blocking-reason.vo.js";
import type { WarningMessage } from "../../value-objects/warning-message.vo.js";
import { createWarningMessageCollection } from "../../value-objects/warning-message.vo.js";

export type PipelineHealthSnapshot = Readonly<{
  id: PipelineHealthSnapshotId;
  version: EntityVersion;
  snapshot_at: Timestamp;
  covered_modules: readonly TargetModule[];
  module_metrics: readonly ModuleHealthMetric[];
  pass_rate: PassRate;
  regression_status: RegressionStatus;
  release_readiness_status: ReleaseReadinessStatus;
  blocking_issues: readonly BlockingReason[];
  warnings: readonly WarningMessage[];
}>;

export const createPipelineHealthSnapshot = (input: Omit<PipelineHealthSnapshot, "pass_rate"> & {
  pass_rate: number | PassRate;
}): PipelineHealthSnapshot => {
  if (!Object.values(RegressionStatus).includes(input.regression_status)) {
    throw new ValidationError("INVALID_PIPELINE_HEALTH_SNAPSHOT", "regression_status is invalid");
  }
  if (!Object.values(ReleaseReadinessStatus).includes(input.release_readiness_status)) {
    throw new ValidationError("INVALID_PIPELINE_HEALTH_SNAPSHOT", "release_readiness_status is invalid");
  }
  if (input.covered_modules.length === 0) {
    throw new ValidationError("INVALID_PIPELINE_HEALTH_SNAPSHOT", "covered_modules must not be empty");
  }
  if (input.release_readiness_status === ReleaseReadinessStatus.READY && input.blocking_issues.length > 0) {
    throw new ValidationError(
      "INVALID_PIPELINE_HEALTH_SNAPSHOT",
      "PipelineHealthSnapshot.release_readiness_status cannot be READY when blocking_issues are present",
    );
  }
  return deepFreeze({
    ...input,
    pass_rate: createPassRate(input.pass_rate),
    blocking_issues: createBlockingReasonCollection(input.blocking_issues),
    warnings: createWarningMessageCollection(input.warnings),
    module_metrics: deepFreeze([...input.module_metrics]),
    covered_modules: deepFreeze([...input.covered_modules]),
  });
};
