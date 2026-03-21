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
export declare const createGovernanceCompatibilityResult: (input: GovernanceCompatibilityResult) => GovernanceCompatibilityResult;
//# sourceMappingURL=governance-compatibility-result.entity.d.ts.map