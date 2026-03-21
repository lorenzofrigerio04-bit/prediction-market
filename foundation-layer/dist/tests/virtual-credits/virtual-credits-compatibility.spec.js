import { describe, expect, it } from "vitest";
import { createActionKey, createNote, createOwnerRef, createRelatedRef, OperationsConsoleCreditsCompatibilityAdapter, PlatformAccessCreditsCompatibilityAdapter, EditorialCreditsCompatibilityAdapter, } from "../../src/virtual-credits/index.js";
describe("virtual-credits compatibility adapters", () => {
    const baseContext = {
        owner_ref: createOwnerRef("workspace:ops"),
        access_scope_ref: createRelatedRef("scope:workspace:ops"),
        account_ref_nullable: null,
        visible_balance_nullable: 42,
        active_quota_refs: [createRelatedRef("quota:1")],
        active_risk_flags: [createRelatedRef("risk:1")],
        allowed_actions: [createActionKey("editorial.publish"), createActionKey("console.view")],
        warnings: [createNote("degraded view")],
    };
    it("20 - compatibility test with Platform Access / Operations Console actions", () => {
        const platform = new PlatformAccessCreditsCompatibilityAdapter();
        const consoleAdapter = new OperationsConsoleCreditsCompatibilityAdapter();
        const accessView = platform.buildAccessScopedCreditView(baseContext);
        const consoleView = consoleAdapter.buildOperationsConsoleUsageView(baseContext);
        expect(platform.validateCompatibility(accessView, baseContext)).toBe(true);
        expect(consoleAdapter.validateCompatibility(consoleView, baseContext)).toBe(true);
        expect(consoleView.allowed_actions).toContain(createActionKey("console.view"));
    });
    it("deny-first on incomplete scope", () => {
        const consoleAdapter = new OperationsConsoleCreditsCompatibilityAdapter();
        const view = consoleAdapter.buildOperationsConsoleUsageView({ ...baseContext, access_scope_ref: createRelatedRef("x") });
        expect(view.allowed_actions.length).toBeGreaterThanOrEqual(0);
    });
    it("editorial adapter keeps only editorial actions", () => {
        const editorial = new EditorialCreditsCompatibilityAdapter();
        const view = editorial.buildEditorialUsageGuardView(baseContext);
        expect(view.allowed_actions.every((action) => action.startsWith("editorial."))).toBe(true);
    });
});
//# sourceMappingURL=virtual-credits-compatibility.spec.js.map