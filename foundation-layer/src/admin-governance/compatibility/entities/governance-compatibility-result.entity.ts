import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { CompatibilityStatus } from "../../enums/compatibility-status.enum.js";
import type { GovernanceCompatibilityViewId, ModuleKey, OperationKey, VersionTag } from "../../value-objects/index.js";

export type GovernanceCompatibilityResult = Readonly<{
  id: GovernanceCompatibilityViewId;
  version: VersionTag;
  module_key: ModuleKey;
  allowed_operations: readonly OperationKey[];
  denied_operations: readonly OperationKey[];
  status: CompatibilityStatus;
}>;

export const createGovernanceCompatibilityResult = (input: GovernanceCompatibilityResult): GovernanceCompatibilityResult =>
  deepFreeze({ ...input });
