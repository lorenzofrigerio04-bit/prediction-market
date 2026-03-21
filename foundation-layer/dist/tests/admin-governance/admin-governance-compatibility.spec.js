import { describe, expect, it } from "vitest";
import { DeterministicGovernanceCompatibilityAdapter, PlatformAccessAdminGovernanceCompatibilityAdapter, OperationsConsoleAdminGovernanceCompatibilityAdapter, VirtualCreditsAdminGovernanceCompatibilityAdapter, createGovernanceMetadata, createModuleKey, createOperationKey, validateAdminGovernanceCompatibilityView, validateGovernanceCompatibilityView, } from "../../src/admin-governance/index.js";
describe("admin-governance compatibility adapters", () => {
    const context = {
        module_key: createModuleKey("operations-console"),
        requested_operations: [createOperationKey("publish"), createOperationKey("review")],
        denied_operations: [createOperationKey("publish")],
        lossy_fields: ["warnings"],
        metadata: createGovernanceMetadata({ adapter: "test" }),
    };
    it("1 - deny-first semantics across adapters", () => {
        const platform = new PlatformAccessAdminGovernanceCompatibilityAdapter();
        const consoleAdapter = new OperationsConsoleAdminGovernanceCompatibilityAdapter();
        const credits = new VirtualCreditsAdminGovernanceCompatibilityAdapter();
        const p = platform.buildPlatformAccessView(context);
        const c = consoleAdapter.buildOperationsConsoleView(context);
        const v = credits.buildVirtualCreditsView(context);
        expect(p.allowed_operations).not.toContain(createOperationKey("publish"));
        expect(c.allowed_operations).not.toContain(createOperationKey("publish"));
        expect(v.allowed_operations).not.toContain(createOperationKey("publish"));
        expect(p.denied_operations).toContain(createOperationKey("publish"));
        expect(c.denied_operations).toContain(createOperationKey("publish"));
        expect(v.denied_operations).toContain(createOperationKey("publish"));
    });
    it("2 - compatibility validator rejects incomplete deny-first compatibility", () => {
        const adapter = new PlatformAccessAdminGovernanceCompatibilityAdapter();
        const view = adapter.buildPlatformAccessView(context);
        const report = validateAdminGovernanceCompatibilityView(view, undefined, {
            ...context,
            denied_operations: [createOperationKey("publish"), createOperationKey("delete")],
        });
        expect(report.isValid).toBe(false);
        expect(report.issues.some((issue) => issue.code === "COMPAT_INCOMPLETE_DENY")).toBe(true);
    });
    it("3 - compatibility validator rejects duplicate operations", () => {
        const adapter = new PlatformAccessAdminGovernanceCompatibilityAdapter();
        const view = adapter.buildPlatformAccessView(context);
        const report = validateAdminGovernanceCompatibilityView({
            ...view,
            denied_operations: [createOperationKey("publish"), createOperationKey("publish")],
        });
        expect(report.isValid).toBe(false);
        expect(report.issues.some((issue) => issue.code === "COMPAT_DENIED_DUPLICATE")).toBe(true);
    });
    it("4 - deterministic alias adapter resolves same deny-first output", () => {
        const deterministic = new DeterministicGovernanceCompatibilityAdapter();
        const view = deterministic.buildPlatformAccessView(context);
        expect(validateGovernanceCompatibilityView(view).isValid).toBe(true);
        expect(view.allowed_operations).toEqual([createOperationKey("review")]);
        expect(view.status).toBe("PARTIAL");
    });
});
//# sourceMappingURL=admin-governance-compatibility.spec.js.map