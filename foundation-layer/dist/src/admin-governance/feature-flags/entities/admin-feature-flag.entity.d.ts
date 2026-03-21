import { FeatureFlagDefaultState } from "../../enums/feature-flag-default-state.enum.js";
import { SafetyControlLevel } from "../../enums/safety-control-level.enum.js";
import type { ActorRef, AdminFeatureFlagId, AuditRef, FeatureFlagKey, GovernanceModuleId, GovernanceSourceId, Metadata, VersionTag } from "../../value-objects/index.js";
export type AdminFeatureFlag = Readonly<{
    id: AdminFeatureFlagId;
    version: VersionTag;
    flag_key: FeatureFlagKey;
    module_id: GovernanceModuleId;
    source_id_nullable: GovernanceSourceId | null;
    default_state: FeatureFlagDefaultState;
    enabled: boolean;
    safety_level: SafetyControlLevel;
    owner_ref: ActorRef;
    audit_ref: AuditRef;
    metadata: Metadata;
}>;
export declare const createAdminFeatureFlag: (input: AdminFeatureFlag) => AdminFeatureFlag;
//# sourceMappingURL=admin-feature-flag.entity.d.ts.map