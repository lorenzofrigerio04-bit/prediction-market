import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { CompatibilityStatus } from "../../enums/compatibility-status.enum.js";
import type {
  GovernanceCompatibilityViewId,
  Metadata,
  ModuleKey,
  OperationKey,
  VersionTag,
} from "../../value-objects/index.js";

export type AdminGovernanceCompatibilityView = Readonly<{
  id: GovernanceCompatibilityViewId;
  version: VersionTag;
  module_key: ModuleKey;
  requested_operations: readonly OperationKey[];
  allowed_operations: readonly OperationKey[];
  denied_operations: readonly OperationKey[];
  lossy_fields: readonly string[];
  status: CompatibilityStatus;
  metadata: Metadata;
}>;

export const createAdminGovernanceCompatibilityView = (
  input: AdminGovernanceCompatibilityView,
): AdminGovernanceCompatibilityView => deepFreeze({ ...input });
