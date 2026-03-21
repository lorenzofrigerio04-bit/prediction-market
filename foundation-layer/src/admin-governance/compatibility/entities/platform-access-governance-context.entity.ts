import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { ModuleKey, OperationKey } from "../../value-objects/index.js";

export type PlatformAccessGovernanceContext = Readonly<{
  module_key: ModuleKey;
  requested_operations: readonly OperationKey[];
  denied_operations: readonly OperationKey[];
}>;

export const createPlatformAccessGovernanceContext = (input: PlatformAccessGovernanceContext): PlatformAccessGovernanceContext =>
  deepFreeze({ ...input });
