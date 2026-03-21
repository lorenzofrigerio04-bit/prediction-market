import { ActionKey } from "../../enums/action-key.enum.js";
import { ScopeType } from "../../enums/scope-type.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import type { PlatformActionCompatibilityId } from "../../value-objects/platform-access-ids.vo.js";
import type { CapabilityFlagKey } from "../../value-objects/capability-flag-key.vo.js";
import type { VersionTag } from "../../value-objects/version-tag.vo.js";
export type PlatformActionCompatibility = Readonly<{
    id: PlatformActionCompatibilityId;
    version: VersionTag;
    target_module: TargetModule;
    action_key: ActionKey;
    required_scope_type: ScopeType;
    required_capabilities_nullable: readonly CapabilityFlagKey[] | null;
    notes_nullable: string | null;
    active: boolean;
}>;
export declare const createPlatformActionCompatibility: (input: PlatformActionCompatibility) => PlatformActionCompatibility;
//# sourceMappingURL=platform-action-compatibility.entity.d.ts.map