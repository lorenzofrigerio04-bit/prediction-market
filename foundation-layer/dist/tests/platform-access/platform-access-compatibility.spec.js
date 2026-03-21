import { describe, expect, it } from "vitest";
import { ActionKey } from "../../src/platform-access/enums/action-key.enum.js";
import { ScopeType } from "../../src/platform-access/enums/scope-type.enum.js";
import { TargetModule } from "../../src/platform-access/enums/target-module.enum.js";
import { DeterministicPlatformCompatibilityAdapter } from "../../src/platform-access/compatibility/implementations/deterministic-platform-compatibility-adapter.js";
import { createPlatformActionCompatibility, } from "../../src/platform-access/compatibility/entities/platform-action-compatibility.entity.js";
import { createCapabilityFlagKey } from "../../src/platform-access/value-objects/capability-flag-key.vo.js";
import { createPlatformActionCompatibilityId } from "../../src/platform-access/value-objects/platform-access-ids.vo.js";
import { createVersionTag } from "../../src/platform-access/value-objects/version-tag.vo.js";
import { validatePlatformActionCompatibility } from "../../src/platform-access/validators/validate-platform-action-compatibility.js";
const makeCompatibility = (overrides) => createPlatformActionCompatibility({
    id: createPlatformActionCompatibilityId("pac_platform_access_alpha001"),
    version: createVersionTag("v1.0.0"),
    target_module: TargetModule.PLATFORM_ACCESS,
    action_key: ActionKey.MANAGE_ROLE_ASSIGNMENTS,
    required_scope_type: ScopeType.GLOBAL,
    required_capabilities_nullable: null,
    notes_nullable: "compatibility fixture",
    active: true,
    ...overrides,
});
describe("platform-access compatibility requirements", () => {
    it("15 - lists compatibility entries for every target module", () => {
        const adapter = new DeterministicPlatformCompatibilityAdapter();
        const modules = adapter.listCompatibilityForAction(ActionKey.VIEW_EDITORIAL_QUEUE).map((entry) => entry.target_module);
        expect(modules).toEqual(Object.values(TargetModule));
    });
    it("16 - provides deterministic compatibility lookup by module+action", () => {
        const adapter = new DeterministicPlatformCompatibilityAdapter();
        const entry = adapter.findByModuleAndAction(TargetModule.EDITORIAL, ActionKey.VIEW_EDITORIAL_QUEUE);
        expect(entry).not.toBeNull();
        expect(entry?.target_module).toBe(TargetModule.EDITORIAL);
        expect(entry?.action_key).toBe(ActionKey.VIEW_EDITORIAL_QUEUE);
    });
    it("17 - keeps PLATFORM_ACCESS compatibility on GLOBAL scope typing", () => {
        const adapter = new DeterministicPlatformCompatibilityAdapter();
        const entry = adapter.findByModuleAndAction(TargetModule.PLATFORM_ACCESS, ActionKey.MANAGE_ROLE_ASSIGNMENTS);
        expect(entry).not.toBeNull();
        expect(entry?.required_scope_type).toBe(ScopeType.GLOBAL);
        expect(validatePlatformActionCompatibility(entry).isValid).toBe(true);
    });
    it("18 - rejects PLATFORM_ACCESS compatibility with ENTITY scope", () => {
        const report = validatePlatformActionCompatibility(makeCompatibility({
            required_scope_type: ScopeType.ENTITY,
        }));
        expect(report.isValid).toBe(false);
    });
    it("19 - rejects inactive compatibility that still advertises required capabilities", () => {
        const report = validatePlatformActionCompatibility(makeCompatibility({
            active: false,
            required_capabilities_nullable: [createCapabilityFlagKey("admin.override")],
        }));
        expect(report.isValid).toBe(false);
    });
});
//# sourceMappingURL=platform-access-compatibility.spec.js.map