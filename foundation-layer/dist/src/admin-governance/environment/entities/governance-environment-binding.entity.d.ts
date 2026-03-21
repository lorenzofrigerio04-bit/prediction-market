import { EnvironmentTier } from "../../enums/environment-tier.enum.js";
import { GovernanceEnvironmentStatus } from "../../enums/governance-environment-status.enum.js";
import type { EnvironmentKey, GovernanceEnvironmentId, GovernanceModuleId, Metadata, VersionTag } from "../../value-objects/index.js";
export type GovernanceEnvironmentBinding = Readonly<{
    id: GovernanceEnvironmentId;
    version: VersionTag;
    module_id: GovernanceModuleId;
    environment_key: EnvironmentKey;
    environment_tier: EnvironmentTier;
    status: GovernanceEnvironmentStatus;
    metadata: Metadata;
}>;
export declare const createGovernanceEnvironmentBinding: (input: GovernanceEnvironmentBinding) => GovernanceEnvironmentBinding;
//# sourceMappingURL=governance-environment-binding.entity.d.ts.map