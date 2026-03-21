import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoveryRunId } from "../value-objects/discovery-run-id.vo.js";
import { DiscoveryErrorCode } from "../enums/discovery-error-code.enum.js";
import type { DiscoveryValidationFailure } from "./discovery-validation-failure.entity.js";

export type DiscoveryErrorReport = Readonly<{
  runId: DiscoveryRunId;
  code: DiscoveryErrorCode;
  message: string;
  failures: readonly DiscoveryValidationFailure[];
  timestamp: Timestamp;
}>;

export const createDiscoveryErrorReport = (
  input: DiscoveryErrorReport,
): DiscoveryErrorReport =>
  deepFreeze({
    ...input,
    failures: [...input.failures],
  });
