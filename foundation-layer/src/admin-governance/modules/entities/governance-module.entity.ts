import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { GovernanceModuleStatus } from "../../enums/governance-module-status.enum.js";
import type { GovernanceModuleId, Metadata, ModuleKey, VersionTag } from "../../value-objects/index.js";

export type GovernanceModule = Readonly<{
  id: GovernanceModuleId;
  version: VersionTag;
  module_key: ModuleKey;
  status: GovernanceModuleStatus;
  supported_operations: readonly string[];
  metadata: Metadata;
}>;

export const createGovernanceModule = (input: GovernanceModule): GovernanceModule => deepFreeze({ ...input });
