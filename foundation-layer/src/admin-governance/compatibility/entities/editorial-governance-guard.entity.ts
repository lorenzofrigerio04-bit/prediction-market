import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { OperationKey } from "../../value-objects/index.js";

export type EditorialGovernanceGuard = Readonly<{ denied_operations: readonly OperationKey[] }>;
export const createEditorialGovernanceGuard = (input: EditorialGovernanceGuard): EditorialGovernanceGuard => deepFreeze({ ...input });
