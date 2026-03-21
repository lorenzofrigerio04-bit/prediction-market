import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { OperationKey } from "../../value-objects/index.js";

export type PublicationGovernanceGuard = Readonly<{ denied_operations: readonly OperationKey[] }>;
export const createPublicationGovernanceGuard = (input: PublicationGovernanceGuard): PublicationGovernanceGuard => deepFreeze({ ...input });
