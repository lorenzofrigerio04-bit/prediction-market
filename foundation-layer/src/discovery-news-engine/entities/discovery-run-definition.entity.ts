import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { DiscoveryRunTrigger } from "../enums/discovery-run-trigger.enum.js";
import type { DiscoveryRunId } from "../value-objects/discovery-run-id.vo.js";
import type { DiscoverySourceId } from "../value-objects/discovery-source-id.vo.js";
import type { DiscoveryScheduleHint } from "../value-objects/discovery-schedule-hint.vo.js";
import type { DiscoveryExecutionWindow } from "../value-objects/discovery-execution-window.vo.js";

export type DiscoveryRunDefinition = Readonly<{
  runId: DiscoveryRunId;
  sourceIds: readonly DiscoverySourceId[];
  trigger: DiscoveryRunTrigger;
  scheduleHintNullable: DiscoveryScheduleHint | null;
  executionWindowNullable: DiscoveryExecutionWindow | null;
}>;

export const createDiscoveryRunDefinition = (
  input: DiscoveryRunDefinition,
): DiscoveryRunDefinition =>
  deepFreeze({
    ...input,
    sourceIds: [...input.sourceIds],
    scheduleHintNullable: input.scheduleHintNullable ?? null,
    executionWindowNullable: input.executionWindowNullable ?? null,
  });
