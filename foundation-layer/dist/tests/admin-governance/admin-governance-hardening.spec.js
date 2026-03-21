import { describe, expect, it } from "vitest";
import { requireSchemaValidator } from "../../src/validators/common/validation-result.js";
import * as foundation from "../../src/index.js";
import { ADMIN_FEATURE_FLAG_SCHEMA_ID, ADMIN_GOVERNANCE_COMPATIBILITY_VIEW_SCHEMA_ID, adminGovernanceSchemas, createAdminFeatureFlag, createAdminSafetyDecision, createAdminSafetyDecisionId, createGovernanceAuditRef, createGovernanceMetadata, createGovernanceVersionTag, createEnvironmentControlState, createEnvironmentControlStateId, createEnvironmentKey, createFeatureFlagKey, createGovernanceAuditLink, createGovernanceAuditLinkId, createGovernanceCompatibilityView, createGovernanceCompatibilityViewId, createModuleControlId, createModuleKey, createOperationKey, DeterministicEnvironmentGovernanceBuilder, DeterministicEnvironmentControlStateBuilder, EMERGENCY_CONTROL_SCHEMA_ID, EDITORIAL_GOVERNANCE_GUARD_SCHEMA_ID, GOVERNANCE_COMPATIBILITY_RESULT_SCHEMA_ID, EnvironmentTier, FeatureFlagDefaultState, GOVERNANCE_AUDIT_LINK_SCHEMA_ID, GOVERNANCE_DECISION_SCHEMA_ID, GOVERNANCE_ENVIRONMENT_BINDING_SCHEMA_ID, GOVERNANCE_MODULE_SCHEMA_ID, GOVERNANCE_SOURCE_SCHEMA_ID, GUARDRAIL_POLICY_SCHEMA_ID, OPERATIONS_CONSOLE_GOVERNANCE_VIEW_SCHEMA_ID, OVERRIDE_REQUEST_SCHEMA_ID, PLATFORM_ACCESS_GOVERNANCE_CONTEXT_SCHEMA_ID, PUBLICATION_GOVERNANCE_GUARD_SCHEMA_ID, RELIABILITY_GOVERNANCE_GUARD_SCHEMA_ID, SafetyControlLevel, VIRTUAL_CREDITS_GOVERNANCE_GUARD_SCHEMA_ID, validateAdminGovernanceFamilyAggregate, } from "../../src/admin-governance/index.js";
import { AuditLinkType, CompatibilityStatus, GovernanceDecisionStatus, GovernanceEnvironmentStatus, } from "../../src/admin-governance/enums/index.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
describe("admin-governance hardening", () => {
    it("1 - registers every admin-governance schema in AJV", () => {
        const schemaIds = [
            ADMIN_FEATURE_FLAG_SCHEMA_ID,
            GOVERNANCE_MODULE_SCHEMA_ID,
            GOVERNANCE_SOURCE_SCHEMA_ID,
            GUARDRAIL_POLICY_SCHEMA_ID,
            EMERGENCY_CONTROL_SCHEMA_ID,
            OVERRIDE_REQUEST_SCHEMA_ID,
            GOVERNANCE_ENVIRONMENT_BINDING_SCHEMA_ID,
            GOVERNANCE_DECISION_SCHEMA_ID,
            GOVERNANCE_AUDIT_LINK_SCHEMA_ID,
            ADMIN_GOVERNANCE_COMPATIBILITY_VIEW_SCHEMA_ID,
            GOVERNANCE_COMPATIBILITY_RESULT_SCHEMA_ID,
            PLATFORM_ACCESS_GOVERNANCE_CONTEXT_SCHEMA_ID,
            OPERATIONS_CONSOLE_GOVERNANCE_VIEW_SCHEMA_ID,
            EDITORIAL_GOVERNANCE_GUARD_SCHEMA_ID,
            PUBLICATION_GOVERNANCE_GUARD_SCHEMA_ID,
            RELIABILITY_GOVERNANCE_GUARD_SCHEMA_ID,
            VIRTUAL_CREDITS_GOVERNANCE_GUARD_SCHEMA_ID,
        ];
        for (const schemaId of schemaIds) {
            expect(() => requireSchemaValidator(schemaId)).not.toThrow();
        }
        expect(adminGovernanceSchemas.length).toBeGreaterThanOrEqual(17);
    });
    it("2 - preserves root and namespace exports", () => {
        expect(typeof foundation.adminGovernance).toBe("object");
        expect(typeof foundation.adminGovernance.validateAdminFeatureFlag).toBe("function");
        expect(typeof foundation.adminGovernance.validateFeatureFlag).toBe("function");
        expect(typeof foundation.adminGovernance.validateModuleControl).toBe("function");
        expect(typeof foundation.adminGovernance.validateEnvironmentControlState).toBe("function");
        expect(Array.isArray(foundation.adminGovernance.adminGovernanceSchemas)).toBe(true);
    });
    it("3 - environment builder upsert keeps latest status", () => {
        const builder = new DeterministicEnvironmentGovernanceBuilder();
        const aliasBuilder = new DeterministicEnvironmentControlStateBuilder();
        const moduleId = createModuleControlId("agm_governancemod001");
        const first = createEnvironmentControlState({
            id: createEnvironmentControlStateId("agev_environmentbind01"),
            version: createGovernanceVersionTag("v1.0.0"),
            module_id: moduleId,
            environment_key: createEnvironmentKey("prod.eu"),
            environment_tier: EnvironmentTier.PROD,
            status: GovernanceEnvironmentStatus.ACTIVE,
            metadata: createGovernanceMetadata(),
        });
        const second = { ...first, status: GovernanceEnvironmentStatus.DISABLED };
        builder.upsert(first);
        builder.upsert(second);
        aliasBuilder.upsert(first);
        aliasBuilder.upsert(second);
        expect(builder.getForModule(moduleId).length).toBe(1);
        expect(builder.getForModule(moduleId)[0]?.status).toBe(GovernanceEnvironmentStatus.DISABLED);
        expect(aliasBuilder.getForModule(moduleId).length).toBe(1);
        expect(aliasBuilder.getForModule(moduleId)[0]?.status).toBe(GovernanceEnvironmentStatus.DISABLED);
    });
    it("4 - aggregate validator enforces audit links and deny-first", () => {
        const flag = createAdminFeatureFlag({
            id: "agf_featureflagalpha001",
            version: createGovernanceVersionTag("v1.0.0"),
            flag_key: createFeatureFlagKey("admin.governance.safety"),
            module_id: createModuleControlId("agm_governancemod001"),
            source_id_nullable: null,
            default_state: FeatureFlagDefaultState.DISABLED,
            enabled: false,
            safety_level: SafetyControlLevel.SOFT,
            owner_ref: "admin:root",
            audit_ref: createGovernanceAuditRef("audit:flag:1"),
            metadata: createGovernanceMetadata(),
        });
        const report = validateAdminGovernanceFamilyAggregate({
            featureFlags: [flag],
            decisions: [
                createAdminSafetyDecision({
                    id: createAdminSafetyDecisionId("agd_decisionrefalpha001"),
                    version: createGovernanceVersionTag("v1.0.0"),
                    module_id: createModuleControlId("agm_governancemod001"),
                    operation_key: createOperationKey("publish"),
                    status: GovernanceDecisionStatus.DENIED,
                    decided_by: "admin:root",
                    decided_at: createTimestamp("2026-01-01T00:00:00.000Z"),
                    audit_ref: createGovernanceAuditRef("audit:decision:good"),
                    reasons: ["blocked"],
                    metadata: createGovernanceMetadata(),
                }),
            ],
            auditLinks: [createGovernanceAuditLink({
                    id: createGovernanceAuditLinkId("aga_auditlinkrefalpha01"),
                    version: createGovernanceVersionTag("v1.0.0"),
                    audit_ref: createGovernanceAuditRef("audit:missing"),
                    link_type: AuditLinkType.DECISION,
                    decision_ref_nullable: null,
                    override_ref_nullable: null,
                    metadata: createGovernanceMetadata(),
                })],
            compatibilityViews: [createGovernanceCompatibilityView({
                    id: createGovernanceCompatibilityViewId("agc_compatibilityalpha01"),
                    version: createGovernanceVersionTag("v1.0.0"),
                    module_key: createModuleKey("ops"),
                    requested_operations: [createOperationKey("publish")],
                    allowed_operations: [createOperationKey("publish")],
                    denied_operations: [createOperationKey("publish")],
                    lossy_fields: [],
                    status: CompatibilityStatus.PARTIAL,
                    metadata: createGovernanceMetadata(),
                })],
        });
        expect(report.isValid).toBe(false);
        expect(report.issues.length).toBeGreaterThanOrEqual(2);
        expect(report.issues.some((issue) => issue.code === "AGGREGATE_AUDIT_LINK_ORPHAN")).toBe(true);
        expect(report.issues.some((issue) => issue.code === "AGGREGATE_DENY_FIRST_CONFLICT")).toBe(true);
    });
    it("5 - additionalProperties hardening on feature flag schema", () => {
        const validator = requireSchemaValidator(ADMIN_FEATURE_FLAG_SCHEMA_ID);
        const payload = {
            id: "agf_featureflagalpha001",
            version: "v1.0.0",
            flag_key: "admin.governance.safety",
            module_id: "agm_governancemod001",
            source_id_nullable: null,
            default_state: "ENABLED",
            enabled: true,
            safety_level: "HARD",
            owner_ref: "admin:root",
            audit_ref: "audit:flag:1",
            metadata: {},
            injected: true,
        };
        expect(validator(payload)).toBe(false);
        expect(validator.errors?.length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=admin-governance-hardening.spec.js.map