import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { ModuleKey, OperationKey } from "../../value-objects/index.js";

export type OperationsConsoleGovernanceView = Readonly<{
  module_key: ModuleKey;
  visible_operations: readonly OperationKey[];
}>;

export const createOperationsConsoleGovernanceView = (input: OperationsConsoleGovernanceView): OperationsConsoleGovernanceView =>
  deepFreeze({ ...input });
