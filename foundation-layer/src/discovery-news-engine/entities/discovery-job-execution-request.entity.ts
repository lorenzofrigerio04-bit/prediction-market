import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoveryJobDefinition } from "./discovery-job-definition.entity.js";

export type DiscoveryJobExecutionRequest = Readonly<{
  jobDefinition: DiscoveryJobDefinition;
  requestedAt: Timestamp;
}>;

export const createDiscoveryJobExecutionRequest = (
  input: DiscoveryJobExecutionRequest,
): DiscoveryJobExecutionRequest => deepFreeze({ ...input });
