import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { OperationKey } from "../../value-objects/index.js";

export type ReliabilityGovernanceGuard = Readonly<{ denied_operations: readonly OperationKey[] }>;
export const createReliabilityGovernanceGuard = (input: ReliabilityGovernanceGuard): ReliabilityGovernanceGuard => deepFreeze({ ...input });
