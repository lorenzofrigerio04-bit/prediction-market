import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { DiscoveryJobId } from "../value-objects/discovery-job-id.vo.js";
import type { DiscoveryRunDefinition } from "./discovery-run-definition.entity.js";
import type { DiscoveryScheduleHint } from "../value-objects/discovery-schedule-hint.vo.js";

export type DiscoveryJobDefinition = Readonly<{
  jobId: DiscoveryJobId;
  runDefinition: DiscoveryRunDefinition;
  scheduleHint: DiscoveryScheduleHint;
  maxDurationSecondsNullable: number | null;
}>;

export const createDiscoveryJobDefinition = (
  input: DiscoveryJobDefinition,
): DiscoveryJobDefinition =>
  deepFreeze({
    ...input,
    maxDurationSecondsNullable: input.maxDurationSecondsNullable ?? null,
  });
