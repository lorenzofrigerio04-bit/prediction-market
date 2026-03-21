import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { OperationKey } from "../../value-objects/index.js";

export type VirtualCreditsGovernanceGuard = Readonly<{ denied_operations: readonly OperationKey[] }>;
export const createVirtualCreditsGovernanceGuard = (input: VirtualCreditsGovernanceGuard): VirtualCreditsGovernanceGuard => deepFreeze({ ...input });
