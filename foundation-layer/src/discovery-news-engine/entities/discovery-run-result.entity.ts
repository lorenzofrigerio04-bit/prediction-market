import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoveryRunId } from "../value-objects/discovery-run-id.vo.js";
import { DiscoveryRunStatus } from "../enums/discovery-run-status.enum.js";
import type { DiscoveryRunMetrics } from "./discovery-run-metrics.entity.js";
import type { DiscoveryErrorReport } from "./discovery-error-report.entity.js";

export type DiscoveryRunResult = Readonly<{
  runId: DiscoveryRunId;
  status: DiscoveryRunStatus;
  startedAt: Timestamp;
  finishedAtNullable: Timestamp | null;
  metrics: DiscoveryRunMetrics;
  errorReportNullable: DiscoveryErrorReport | null;
}>;

export const createDiscoveryRunResult = (
  input: DiscoveryRunResult,
): DiscoveryRunResult =>
  deepFreeze({
    ...input,
    finishedAtNullable: input.finishedAtNullable ?? null,
    errorReportNullable: input.errorReportNullable ?? null,
  });
