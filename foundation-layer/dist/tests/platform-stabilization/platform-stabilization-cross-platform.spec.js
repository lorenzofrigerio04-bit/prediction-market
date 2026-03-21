import { describe, expect, it } from "vitest";
import * as foundation from "../../src/index.js";
import * as schemaApi from "../../src/schemas/index.js";
import { requireSchemaValidator } from "../../src/validators/common/validation-result.js";
import { ActionKey, DeterministicPlatformCompatibilityAdapter, TargetModule, validatePlatformActionCompatibility, } from "../../src/platform-access/index.js";
import { PlatformAccessConsoleCompatibilityAdapter, validateOperationsConsoleCompatibility, } from "../../src/operations-console/index.js";
import { createGovernanceMetadata, createModuleKey, createOperationKey, PlatformAccessAdminGovernanceCompatibilityAdapter, } from "../../src/admin-governance/index.js";
import { ConsistencyStatus, createActionKey, createNote, createCreditsCompatibilityView, createOwnerRef, createRelatedRef, OperationsConsoleCreditsCompatibilityAdapter, validateCreditsCompatibility, } from "../../src/virtual-credits/index.js";
describe("platform stabilization cross-module integration", () => {
    it("A - access allowed + governance clear + credits sufficient => action available in console surface", () => {
        const governanceAdapter = new PlatformAccessAdminGovernanceCompatibilityAdapter();
        const governanceView = governanceAdapter.buildOperationsConsoleView({
            module_key: createModuleKey("operations-console"),
            requested_operations: [createOperationKey("open_detail")],
            denied_operations: [],
            lossy_fields: [],
            metadata: createGovernanceMetadata({ source: "test" }),
        });
        const creditsAdapter = new OperationsConsoleCreditsCompatibilityAdapter();
        const creditsContext = {
            owner_ref: createOwnerRef("workspace:ops"),
            access_scope_ref: createRelatedRef("scope:workspace:ops"),
            account_ref_nullable: null,
            visible_balance_nullable: 100,
            active_quota_refs: [],
            active_risk_flags: [],
            allowed_actions: [createActionKey("open_detail")],
            warnings: [],
        };
        const creditsView = creditsAdapter.buildOperationsConsoleUsageView(creditsContext);
        const consoleResult = new PlatformAccessConsoleCompatibilityAdapter().adapt({
            source_module: "platform-access",
            visibility: "visible",
            allowed_actions: governanceView.allowed_operations.map((operation) => operation),
            denied_actions: governanceView.denied_operations.map((operation) => operation),
        });
        expect(validateCreditsCompatibility(creditsView, undefined, creditsContext).isValid).toBe(true);
        expect(validateOperationsConsoleCompatibility(consoleResult, undefined, {
            source_visibility: "visible",
            source_allowed_actions: ["open_detail"],
            source_denied_actions: [],
        }).isValid).toBe(true);
        expect(consoleResult.propagated_allowed_actions).toContain("open_detail");
    });
    it("B - denied action is not exposed as available", () => {
        const result = new PlatformAccessConsoleCompatibilityAdapter().adapt({
            source_module: "platform-access",
            visibility: "partial",
            allowed_actions: ["open_detail", "publish"],
            denied_actions: ["publish"],
        });
        expect(result.propagated_allowed_actions).toEqual(["open_detail"]);
        expect(result.propagated_allowed_actions).not.toContain("publish");
        expect(result.propagated_denied_actions).toContain("publish");
    });
    it("C - credits/quota denied action is surfaced as denied in console contract", () => {
        const creditsContext = {
            owner_ref: createOwnerRef("workspace:ops"),
            access_scope_ref: createRelatedRef("scope:workspace:ops"),
            account_ref_nullable: null,
            visible_balance_nullable: 5,
            active_quota_refs: [createRelatedRef("quota:daily")],
            active_risk_flags: [],
            allowed_actions: [createActionKey("publish")],
            warnings: [],
        };
        const creditsDeniedView = createCreditsCompatibilityView({
            id: creditsContext.access_scope_ref,
            owner_ref: creditsContext.owner_ref,
            access_scope_ref: creditsContext.access_scope_ref,
            account_ref_nullable: creditsContext.account_ref_nullable,
            visible_balance_nullable: creditsContext.visible_balance_nullable,
            active_quota_refs: creditsContext.active_quota_refs,
            active_risk_flags: creditsContext.active_risk_flags,
            allowed_actions: [],
            warnings: [createNote("quota_denied:publish")],
            compatibility_status: ConsistencyStatus.FAILED,
        });
        expect(validateCreditsCompatibility(creditsDeniedView, undefined, creditsContext).isValid).toBe(true);
        const consoleResult = new PlatformAccessConsoleCompatibilityAdapter().adapt({
            source_module: "virtual-credits",
            visibility: "partial",
            allowed_actions: creditsDeniedView.allowed_actions.map((action) => action),
            denied_actions: ["publish"],
        });
        expect(consoleResult.propagated_allowed_actions).not.toContain("publish");
        expect(consoleResult.propagated_denied_actions).toContain("publish");
    });
    it("D - governance block is reflected in action availability", () => {
        const governanceView = new PlatformAccessAdminGovernanceCompatibilityAdapter().buildOperationsConsoleView({
            module_key: createModuleKey("operations-console"),
            requested_operations: [createOperationKey("publish"), createOperationKey("open_detail")],
            denied_operations: [createOperationKey("publish")],
            lossy_fields: ["block"],
            metadata: createGovernanceMetadata({ source: "governance" }),
        });
        const result = new PlatformAccessConsoleCompatibilityAdapter().adapt({
            source_module: "admin-governance",
            visibility: "partial",
            allowed_actions: governanceView.allowed_operations.map((operation) => operation),
            denied_actions: governanceView.denied_operations.map((operation) => operation),
        });
        expect(result.propagated_allowed_actions).not.toContain("publish");
        expect(result.propagated_denied_actions).toContain("publish");
    });
    it("E - all platform schemas are present in global AJV registry", () => {
        const allPlatformSchemas = [
            ...foundation.platformAccess.platformAccessSchemas,
            ...foundation.operationsConsole.operationsConsoleSchemas,
            ...foundation.virtualCredits.virtualCreditSchemas,
            ...foundation.adminGovernance.adminGovernanceSchemas,
        ];
        for (const schema of allPlatformSchemas) {
            expect(() => requireSchemaValidator(String(schema.$id))).not.toThrow();
        }
    });
    it("F - root exports and schema API remain stable", () => {
        expect(typeof foundation.platformAccess).toBe("object");
        expect(typeof foundation.operationsConsole).toBe("object");
        expect(typeof foundation.virtualCredits).toBe("object");
        expect(typeof foundation.adminGovernance).toBe("object");
        expect(typeof foundation.validateAuthorizationDecision).toBe("function");
        expect(typeof foundation.platformAccess.validateAuthorizationDecision).toBe("function");
        expect(typeof foundation.operationsConsole.validateActionSurface).toBe("function");
        expect(typeof foundation.virtualCredits.validateCreditGrant).toBe("function");
        expect(typeof foundation.adminGovernance.validateAdminFeatureFlag).toBe("function");
        expect(Array.isArray(schemaApi.virtualCreditSchemas)).toBe(true);
    });
    it("G - ActionKey and TargetModule compatibility remains coherent", () => {
        const adapter = new DeterministicPlatformCompatibilityAdapter();
        const entries = adapter.listCompatibilityForAction(ActionKey.VIEW_EDITORIAL_QUEUE);
        expect(new Set(entries.map((entry) => entry.target_module))).toEqual(new Set(Object.values(TargetModule)));
        for (const entry of entries) {
            expect(validatePlatformActionCompatibility(entry).isValid).toBe(true);
        }
    });
    it("extra - deny-first fallback with incomplete scope remains conservative", () => {
        const view = new OperationsConsoleCreditsCompatibilityAdapter().buildOperationsConsoleUsageView({
            owner_ref: createOwnerRef("workspace:ops"),
            access_scope_ref: "",
            account_ref_nullable: null,
            visible_balance_nullable: 100,
            active_quota_refs: [],
            active_risk_flags: [],
            allowed_actions: [createActionKey("publish")],
            warnings: [],
        });
        expect(view.allowed_actions).toEqual([]);
        expect(view.compatibility_status).toBe(ConsistencyStatus.FAILED);
        expect(view.warnings.some((warning) => warning.includes("deny-first"))).toBe(true);
    });
    it("extra - governance deny-first remains authoritative even with override metadata", () => {
        const view = new PlatformAccessAdminGovernanceCompatibilityAdapter().buildOperationsConsoleView({
            module_key: createModuleKey("operations-console"),
            requested_operations: [createOperationKey("publish"), createOperationKey("review")],
            denied_operations: [createOperationKey("publish")],
            lossy_fields: ["override_attempt"],
            metadata: createGovernanceMetadata({ override: "requested" }),
        });
        expect(view.allowed_operations).toEqual([createOperationKey("review")]);
        expect(view.denied_operations).toContain(createOperationKey("publish"));
    });
});
//# sourceMappingURL=platform-stabilization-cross-platform.spec.js.map