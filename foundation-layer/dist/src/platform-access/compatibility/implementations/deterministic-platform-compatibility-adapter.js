import { ActionKey } from "../../enums/action-key.enum.js";
import { ScopeType } from "../../enums/scope-type.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import { createPlatformActionCompatibility } from "../entities/platform-action-compatibility.entity.js";
import { createCapabilityFlagKey } from "../../value-objects/capability-flag-key.vo.js";
import { createPlatformActionCompatibilityId } from "../../value-objects/platform-access-ids.vo.js";
import { createVersionTag } from "../../value-objects/version-tag.vo.js";
const keyFor = (target_module, action_key) => `${target_module}::${action_key}`;
const ACTIVE_COMPATIBILITY_KEYS = new Set([
    keyFor(TargetModule.EDITORIAL, ActionKey.VIEW_EDITORIAL_QUEUE),
    keyFor(TargetModule.EDITORIAL, ActionKey.REVIEW_CANDIDATE),
    keyFor(TargetModule.PUBLICATION, ActionKey.APPROVE_PUBLICATION),
    keyFor(TargetModule.PUBLICATION, ActionKey.REJECT_PUBLICATION),
    keyFor(TargetModule.LIVE_INTEGRATION, ActionKey.SCHEDULE_HANDOFF),
    keyFor(TargetModule.RELIABILITY, ActionKey.VIEW_RELIABILITY_REPORTS),
    keyFor(TargetModule.RELIABILITY, ActionKey.TRIGGER_RELIABILITY_GATE),
    keyFor(TargetModule.LEARNING, ActionKey.VIEW_LEARNING_INSIGHTS),
    keyFor(TargetModule.PLATFORM_ACCESS, ActionKey.MANAGE_ROLE_ASSIGNMENTS),
    keyFor(TargetModule.PLATFORM_ACCESS, ActionKey.MANAGE_PERMISSION_POLICIES),
    keyFor(TargetModule.PLATFORM_ACCESS, ActionKey.MANAGE_WORKSPACES),
    keyFor(TargetModule.PLATFORM_ACCESS, ActionKey.VIEW_PLATFORM_AUDIT),
    keyFor(TargetModule.EDITORIAL, ActionKey.OVERRIDE_EDITORIAL_DECISION),
    keyFor(TargetModule.RELIABILITY, ActionKey.OVERRIDE_RELIABILITY_GATE),
    keyFor(TargetModule.PUBLICATION, ActionKey.PUBLISH_ARTIFACT),
    keyFor(TargetModule.PUBLICATION, ActionKey.VIEW_PUBLICATION_PACKAGE),
]);
const resolveScopeType = (target_module) => {
    if (target_module === TargetModule.PLATFORM_ACCESS) {
        return ScopeType.GLOBAL;
    }
    if (target_module === TargetModule.PUBLICATION || target_module === TargetModule.LIVE_INTEGRATION) {
        return ScopeType.WORKSPACE_MODULE;
    }
    return ScopeType.MODULE;
};
const resolveRequiredCapabilities = (action_key, active) => {
    if (!active) {
        return null;
    }
    if (action_key === ActionKey.OVERRIDE_EDITORIAL_DECISION) {
        return [createCapabilityFlagKey("sensitive.editorial_override")];
    }
    if (action_key === ActionKey.OVERRIDE_RELIABILITY_GATE) {
        return [createCapabilityFlagKey("sensitive.reliability_override")];
    }
    return null;
};
export class DeterministicPlatformCompatibilityAdapter {
    listCompatibilityForAction(action_key) {
        const targets = Object.values(TargetModule);
        return targets.map((target, index) => this.buildCompatibility(target, action_key, index));
    }
    findByModuleAndAction(target_module, action_key) {
        const candidates = this.listCompatibilityForAction(action_key);
        return candidates.find((entry) => entry.target_module === target_module) ?? null;
    }
    buildCompatibility(target_module, action_key, index) {
        const active = ACTIVE_COMPATIBILITY_KEYS.has(keyFor(target_module, action_key));
        return createPlatformActionCompatibility({
            id: createPlatformActionCompatibilityId(`pac_${target_module.toLowerCase()}_${action_key.toLowerCase()}_${String(index).padStart(2, "0")}`),
            version: createVersionTag("v1.0.0"),
            target_module,
            action_key,
            required_scope_type: resolveScopeType(target_module),
            required_capabilities_nullable: resolveRequiredCapabilities(action_key, active),
            notes_nullable: active ? "deterministic compatibility matrix" : null,
            active,
        });
    }
}
//# sourceMappingURL=deterministic-platform-compatibility-adapter.js.map