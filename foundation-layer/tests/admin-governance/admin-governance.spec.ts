import { describe, expect, it } from "vitest";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
import {
  AuditLinkType,
  CompatibilityStatus,
  EnvironmentTier,
  FeatureFlagDefaultState,
  GovernanceDecisionStatus,
  GovernanceEnvironmentStatus,
  GovernanceModuleStatus,
  GovernanceSourceType,
  GuardrailSeverity,
  OverrideStatus,
  SafetyControlLevel,
  createActorRef,
  createAdminFeatureFlag,
  createAdminSafetyDecision,
  createAdminSafetyDecisionId,
  createEnvironmentControlState,
  createEnvironmentControlStateId,
  createEnvironmentKey,
  createFeatureFlag,
  createFeatureFlagId,
  createFeatureFlagKey,
  createGenerationGuardrail,
  createGenerationGuardrailId,
  createGovernanceAuditLink,
  createGovernanceAuditLinkId,
  createGovernanceCompatibilityView,
  createGovernanceCompatibilityViewId,
  createGovernanceAuditRef,
  createGovernanceMetadata,
  createGovernanceVersionTag,
  createModuleControl,
  createModuleControlId,
  createModuleKey,
  createOperationKey,
  createPolicyOverride,
  createPolicyOverrideId,
  createReason,
  createSourceEnablementControl,
  createSourceEnablementControlId,
  createSourceKey,
  createThreshold,
  validateAdminSafetyDecision,
  validateFeatureFlag,
  validateGenerationGuardrail,
  validateGovernanceAuditLink,
  validateGovernanceCompatibilityView,
  validateEnvironmentControlState,
  validateModuleControl,
  validatePolicyOverride,
  validateSourceEnablementControl,
} from "../../src/admin-governance/index.js";

const now = createTimestamp("2026-01-01T00:00:00.000Z");

describe("admin-governance canonical naming + validators", () => {
  it("validates feature flag strict equality and alias constructors", () => {
    const flagA = createFeatureFlag({
      id: createFeatureFlagId("agf_featureflagalpha001"),
      version: createGovernanceVersionTag("v1.0.0"),
      flag_key: createFeatureFlagKey("admin.governance.safety"),
      module_id: createModuleControlId("agm_governancemod001"),
      source_id_nullable: createSourceEnablementControlId("ags_governancesrc001"),
      default_state: FeatureFlagDefaultState.ENABLED,
      enabled: true,
      safety_level: SafetyControlLevel.HARD,
      owner_ref: createActorRef("admin:root"),
      audit_ref: createGovernanceAuditRef("audit:flag:1"),
      metadata: createGovernanceMetadata({ scope: "global" }),
    });
    const flagB = createAdminFeatureFlag({ ...flagA, id: createFeatureFlagId("agf_featureflagalpha002") });
    expect(validateFeatureFlag(flagA).isValid).toBe(true);
    expect(validateFeatureFlag(flagB).isValid).toBe(true);
    expect(validateFeatureFlag({ ...flagA, enabled: false }).isValid).toBe(false);
    expect(flagA.id.startsWith("agf_")).toBe(true);
  });

  it("validates module/source/guardrail controls and duplicate key cases", () => {
    const moduleControl = createModuleControl({
      id: createModuleControlId("agm_governancemod001"),
      version: createGovernanceVersionTag("v1.0.0"),
      module_key: createModuleKey("operations-console"),
      status: GovernanceModuleStatus.ACTIVE,
      supported_operations: ["publish", "review"],
      metadata: createGovernanceMetadata(),
    });
    const sourceControl = createSourceEnablementControl({
      id: createSourceEnablementControlId("ags_governancesrc001"),
      version: createGovernanceVersionTag("v1.0.0"),
      source_key: createSourceKey("policy:baseline"),
      source_type: GovernanceSourceType.INTERNAL_POLICY,
      trust_weight: 0.7,
      active: true,
      metadata: createGovernanceMetadata(),
    });
    const guardrail = createGenerationGuardrail({
      id: createGenerationGuardrailId("agr_guardrailpolicy001"),
      version: createGovernanceVersionTag("v1.0.0"),
      module_key: createModuleKey("operations-console"),
      operation_key: createOperationKey("publish"),
      severity: GuardrailSeverity.HIGH,
      deny_by_default: true,
      active: true,
      metadata: createGovernanceMetadata({ threshold: String(createThreshold(0.8)) }),
    });

    expect(validateModuleControl(moduleControl).isValid).toBe(true);
    expect(validateModuleControl({ ...moduleControl, supported_operations: ["publish", "publish"] }).isValid).toBe(false);
    expect(validateSourceEnablementControl(sourceControl).isValid).toBe(true);
    expect(validateSourceEnablementControl({ ...sourceControl, trust_weight: 2 }).isValid).toBe(false);
    expect(validateGenerationGuardrail(guardrail).isValid).toBe(true);
    expect(createReason("deny-first").length).toBeGreaterThan(0);
    expect(moduleControl.supported_operations.length).toBe(2);
    expect(sourceControl.active).toBe(true);
  });

  it("validates policy override and environment ordering/status invariants", () => {
    const override = createPolicyOverride({
      id: createPolicyOverrideId("ago_overriderequest001"),
      version: createGovernanceVersionTag("v1.0.0"),
      module_key: createModuleKey("operations-console"),
      operation_key: createOperationKey("publish"),
      requested_by: createActorRef("admin:ops"),
      reason: createReason("urgent") as never,
      status: OverrideStatus.PENDING,
      requested_at: now,
      expires_at_nullable: createTimestamp("2026-01-02T00:00:00.000Z"),
      resolved_by_nullable: null,
      audit_ref: createGovernanceAuditRef("audit:override:1"),
      metadata: createGovernanceMetadata(),
    });
    const env = createEnvironmentControlState({
      id: createEnvironmentControlStateId("agev_environmentbind01"),
      version: createGovernanceVersionTag("v1.0.0"),
      module_id: createModuleControlId("agm_governancemod001"),
      environment_key: createEnvironmentKey("prod.eu"),
      environment_tier: EnvironmentTier.PROD,
      status: GovernanceEnvironmentStatus.ACTIVE,
      metadata: createGovernanceMetadata(),
    });
    expect(validatePolicyOverride(override).isValid).toBe(true);
    expect(validatePolicyOverride({ ...override, expires_at_nullable: createTimestamp("2025-12-31T00:00:00.000Z") }).isValid).toBe(false);
    expect(validatePolicyOverride({ ...override, status: OverrideStatus.APPROVED, resolved_by_nullable: null }).isValid).toBe(false);
    expect(validateEnvironmentControlState(env).isValid).toBe(true);
    expect(env.environment_tier).toBe(EnvironmentTier.PROD);
    expect(env.status).toBe(GovernanceEnvironmentStatus.ACTIVE);
  });

  it("validates admin safety decision, audit link and compatibility view", () => {
    const decision = createAdminSafetyDecision({
      id: createAdminSafetyDecisionId("agd_decisionrefalpha001"),
      version: createGovernanceVersionTag("v1.0.0"),
      module_id: createModuleControlId("agm_governancemod001"),
      operation_key: createOperationKey("publish"),
      status: GovernanceDecisionStatus.DENIED,
      decided_by: createActorRef("admin:ops"),
      decided_at: now,
      audit_ref: createGovernanceAuditRef("audit:decision:1"),
      reasons: [createReason("risk-high") as never],
      metadata: createGovernanceMetadata(),
    });
    const link = createGovernanceAuditLink({
      id: createGovernanceAuditLinkId("aga_auditlinkrefalpha01"),
      version: createGovernanceVersionTag("v1.0.0"),
      audit_ref: createGovernanceAuditRef("audit:decision:1"),
      link_type: AuditLinkType.DECISION,
      decision_ref_nullable: createAdminSafetyDecisionId("agd_decisionrefalpha001"),
      override_ref_nullable: null,
      metadata: createGovernanceMetadata(),
    });
    const view = createGovernanceCompatibilityView({
      id: createGovernanceCompatibilityViewId("agc_compatibilityalpha01"),
      version: createGovernanceVersionTag("v1.0.0"),
      module_key: createModuleKey("operations-console"),
      requested_operations: [createOperationKey("publish"), createOperationKey("review")],
      allowed_operations: [createOperationKey("review")],
      denied_operations: [createOperationKey("publish")],
      lossy_fields: ["notes"],
      status: CompatibilityStatus.PARTIAL,
      metadata: createGovernanceMetadata(),
    });

    expect(validateAdminSafetyDecision(decision).isValid).toBe(true);
    expect(validateAdminSafetyDecision({ ...decision, reasons: [] }).isValid).toBe(false);
    expect(validateAdminSafetyDecision({ ...decision, reasons: [createReason("risk") as never, createReason("risk") as never] }).isValid).toBe(false);
    expect(validateGovernanceAuditLink(link).isValid).toBe(true);
    expect(validateGovernanceAuditLink({ ...link, decision_ref_nullable: null }).isValid).toBe(false);
    expect(validateGovernanceCompatibilityView(view).isValid).toBe(true);
    expect(validateGovernanceCompatibilityView({ ...view, denied_operations: [createOperationKey("publish"), createOperationKey("publish")] }).isValid).toBe(false);
    expect(validateGovernanceCompatibilityView({ ...view, allowed_operations: [createOperationKey("publish")] }).isValid).toBe(false);
    expect(view.status).toBe(CompatibilityStatus.PARTIAL);
  });
});
