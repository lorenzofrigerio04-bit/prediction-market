import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { RegressionStatus } from "../../enums/regression-status.enum.js";
import { ReleaseReadinessStatus } from "../../enums/release-readiness-status.enum.js";
import { ThresholdStatus } from "../../enums/threshold-status.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import { createPipelineHealthSnapshot, type PipelineHealthSnapshot } from "../entities/pipeline-health-snapshot.entity.js";
import type { PipelineHealthEvaluator, PipelineHealthInput } from "../interfaces/pipeline-health-evaluator.js";
import { createPipelineHealthSnapshotId } from "../../value-objects/reliability-ids.vo.js";
import { type BlockingReason } from "../../value-objects/blocking-reason.vo.js";

const deriveReleaseReadinessStatus = (
  passRate: number,
  regressionStatus: RegressionStatus,
  blockingIssues: readonly BlockingReason[],
): ReleaseReadinessStatus => {
  if (blockingIssues.length > 0 || passRate < 0.75 || regressionStatus === RegressionStatus.BROKEN) {
    return ReleaseReadinessStatus.NOT_READY;
  }
  if (passRate < 0.95 || regressionStatus === RegressionStatus.DEGRADED) {
    return ReleaseReadinessStatus.CONDITIONALLY_READY;
  }
  return ReleaseReadinessStatus.READY;
};

export class DeterministicPipelineHealthEvaluator implements PipelineHealthEvaluator {
  evaluate(input: PipelineHealthInput): PipelineHealthSnapshot {
    const blockingIssues: BlockingReason[] = [];
    const hasBreachedMetric = input.module_metrics.some(
      (metric) => metric.threshold_status === ThresholdStatus.BREACHED,
    );
    if (hasBreachedMetric) {
      blockingIssues.push({
        code: "BREACHED_MODULE_METRIC",
        message: "At least one module metric is breached",
        module_name: input.covered_modules[0] ?? TargetModule.FULL_PIPELINE,
        path: "/module_metrics",
      });
    }
    return createPipelineHealthSnapshot({
      id: createPipelineHealthSnapshotId("phs_evalhealth01"),
      version: createEntityVersion(1),
      snapshot_at: createTimestamp("1970-01-01T00:00:00.000Z"),
      covered_modules: input.covered_modules,
      module_metrics: input.module_metrics,
      pass_rate: input.pass_rate,
      regression_status: input.regression_status,
      release_readiness_status: deriveReleaseReadinessStatus(input.pass_rate, input.regression_status, blockingIssues),
      blocking_issues: blockingIssues,
      warnings: [],
    });
  }
}
