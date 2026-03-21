import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { RegressionStatus } from "../../enums/regression-status.enum.js";
import { ReleaseReadinessStatus } from "../../enums/release-readiness-status.enum.js";
import type { TargetModule } from "../../enums/target-module.enum.js";
import type { ModuleHealthMetric } from "../../metrics/entities/module-health-metric.entity.js";
import { type PassRate } from "../../value-objects/pass-rate.vo.js";
import type { PipelineHealthSnapshotId } from "../../value-objects/reliability-ids.vo.js";
import type { BlockingReason } from "../../value-objects/blocking-reason.vo.js";
import type { WarningMessage } from "../../value-objects/warning-message.vo.js";
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
export declare const createPipelineHealthSnapshot: (input: Omit<PipelineHealthSnapshot, "pass_rate"> & {
    pass_rate: number | PassRate;
}) => PipelineHealthSnapshot;
//# sourceMappingURL=pipeline-health-snapshot.entity.d.ts.map