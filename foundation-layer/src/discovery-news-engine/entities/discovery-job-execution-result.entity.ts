import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoveryJobId } from "../value-objects/discovery-job-id.vo.js";
import type { DiscoveryRunResult } from "./discovery-run-result.entity.js";
import { DiscoveryRunStatus } from "../enums/discovery-run-status.enum.js";

export type DiscoveryJobExecutionResult = Readonly<{
  jobId: DiscoveryJobId;
  runResult: DiscoveryRunResult;
  executedAt: Timestamp;
  status: DiscoveryRunStatus;
}>;

export const createDiscoveryJobExecutionResult = (
  input: DiscoveryJobExecutionResult,
): DiscoveryJobExecutionResult => deepFreeze({ ...input });
