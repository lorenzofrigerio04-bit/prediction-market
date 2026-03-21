import { describe, expect, it } from "vitest";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
import { AccountOwnerScope, AccountStatus, AdjustmentType, AppliedStatus, BonusType, ConsistencyStatus, ConsumptionStatus, createAbuseRiskFlag, createAbuseRiskFlagId, createActionKey, createAdminCreditAdjustment, createAdminCreditAdjustmentId, createAdjustmentReason, createAuditRef, createBonusEligibility, createBonusEligibilityId, createCorrelationId, createCreditBalanceSnapshot, createCreditBalanceSnapshotId, createCreditConsumptionEvent, createCreditConsumptionEventId, createCreditGrant, createCreditGrantId, createCreditLedgerEntry, createCreditLedgerEntryId, createCurrencyKey, createGrantReason, createMetadata, createNote, createOwnerRef, createPolicyKey, createQuotaEvaluation, createQuotaEvaluationId, createQuotaPolicy, createQuotaPolicyId, createRelatedRef, createVersion, createVirtualCreditAccount, createVirtualCreditAccountId, createWindowDefinition, EligibilityStatus, EnforcementMode, GrantStatus, GrantType, LedgerEntryType, MeasurementWindowUnit, OverdraftPolicy, OwnerType, QuotaDecisionStatus, QuotaType, RiskSeverity, RiskType, validateAbuseRiskFlag, validateAdminCreditAdjustment, validateBonusEligibility, validateCreditBalanceSnapshot, validateCreditConsumptionEvent, validateCreditGrant, validateCreditLedgerEntry, validateQuotaEvaluation, validateQuotaPolicy, validateVirtualCreditAccount, } from "../../src/virtual-credits/index.js";
const now = createTimestamp("2026-01-01T00:00:00.000Z");
const buildValidAccount = () => createVirtualCreditAccount({
    id: createVirtualCreditAccountId("vca_validaccount0001"),
    version: createVersion("v1.0.0"),
    owner_type: OwnerType.USER,
    owner_ref: createOwnerRef("user:alpha"),
    account_status: AccountStatus.ACTIVE,
    currency_key: createCurrencyKey("virtual.credit"),
    current_balance_nullable: 100,
    overdraft_policy: OverdraftPolicy.DENY,
    metadata: createMetadata({ tier: "free" }),
});
describe("virtual-credits domain validators", () => {
    it("1 - valid VirtualCreditAccount", () => {
        expect(validateVirtualCreditAccount(buildValidAccount()).isValid).toBe(true);
    });
    it("2 - invalid VirtualCreditAccount without owner_ref", () => {
        const invalid = { ...buildValidAccount(), owner_ref: "" };
        expect(validateVirtualCreditAccount(invalid).isValid).toBe(false);
    });
    it("3/4 - CreditGrant validation", () => {
        const valid = createCreditGrant({
            id: createCreditGrantId("vcg_validgrant00001"),
            version: createVersion("v1.0.0"),
            target_account_id: buildValidAccount().id,
            grant_type: GrantType.WELCOME_BONUS,
            amount: 25,
            issued_by: createRelatedRef("system:welcome"),
            issued_at: now,
            expiration_nullable: null,
            grant_reason: createGrantReason("welcome bonus"),
            grant_status: GrantStatus.ACTIVE,
            source_policy_ref_nullable: null,
        });
        expect(validateCreditGrant(valid).isValid).toBe(true);
        expect(validateCreditGrant({ ...valid, amount: 0 }).isValid).toBe(false);
    });
    it("5/6 - CreditLedgerEntry valid and immutable rule", () => {
        const entry = createCreditLedgerEntry({
            id: createCreditLedgerEntryId("vcl_validentry00001"),
            version: createVersion("v1.0.0"),
            account_id: buildValidAccount().id,
            entry_type: LedgerEntryType.GRANT_ISSUED,
            amount_delta: 20,
            resulting_balance_nullable: 120,
            correlation_id: createCorrelationId("corr:grant:1"),
            caused_by_ref: createRelatedRef("grant:1"),
            created_at: now,
            immutable: true,
        });
        expect(validateCreditLedgerEntry(entry).isValid).toBe(true);
        expect(validateCreditLedgerEntry({ ...entry, immutable: false }).isValid).toBe(false);
    });
    it("7/8 - CreditConsumptionEvent valid and completed-zero invalid", () => {
        const event = createCreditConsumptionEvent({
            id: createCreditConsumptionEventId("vce_validconsume001"),
            version: createVersion("v1.0.0"),
            account_id: buildValidAccount().id,
            action_key: createActionKey("editorial.publish"),
            consumption_amount: 3,
            consumed_at: now,
            related_entity_ref_nullable: null,
            quota_evaluation_ref_nullable: null,
            consumption_status: ConsumptionStatus.COMPLETED,
            notes_nullable: null,
        });
        expect(validateCreditConsumptionEvent(event).isValid).toBe(true);
        expect(validateCreditConsumptionEvent({ ...event, consumption_amount: 0 }).isValid).toBe(false);
    });
    it("9/10 - CreditBalanceSnapshot valid and consistent-without-refs invalid", () => {
        const snapshot = createCreditBalanceSnapshot({
            id: createCreditBalanceSnapshotId("vcs_validsnapshot001"),
            version: createVersion("v1.0.0"),
            account_id: buildValidAccount().id,
            snapshot_balance: 120,
            snapshot_at: now,
            included_ledger_refs: [createCreditLedgerEntryId("vcl_validentry00001")],
            consistency_status: ConsistencyStatus.CONSISTENT,
        });
        expect(validateCreditBalanceSnapshot(snapshot).isValid).toBe(true);
        expect(validateCreditBalanceSnapshot({ ...snapshot, included_ledger_refs: [] }).isValid).toBe(false);
    });
    it("11/12 - QuotaPolicy valid and invalid active max amount", () => {
        const policy = createQuotaPolicy({
            id: createQuotaPolicyId("vqp_validpolicy0001"),
            version: createVersion("v1.0.0"),
            policy_key: createPolicyKey("policy:credits/day"),
            target_scope: AccountOwnerScope.USER,
            quota_type: QuotaType.CREDITS_PER_WINDOW,
            max_amount: 100,
            window_definition: createWindowDefinition({ unit: MeasurementWindowUnit.DAY, size: 1 }),
            enforcement_mode: EnforcementMode.HARD_BLOCK,
            active: true,
        });
        expect(validateQuotaPolicy(policy).isValid).toBe(true);
        expect(validateQuotaPolicy({ ...policy, max_amount: 0 }).isValid).toBe(false);
    });
    it("13/14 - QuotaEvaluation denied requires reasons", () => {
        const denied = createQuotaEvaluation({
            id: createQuotaEvaluationId("vqe_valideval00001"),
            version: createVersion("v1.0.0"),
            policy_id: createQuotaPolicyId("vqp_validpolicy0001"),
            target_account_id: buildValidAccount().id,
            evaluated_action_key: createActionKey("editorial.publish"),
            current_usage: 90,
            requested_usage: 20,
            decision_status: QuotaDecisionStatus.DENIED,
            blocking_reasons: [createNote("limit exceeded")],
            evaluated_at: now,
        });
        expect(validateQuotaEvaluation(denied).isValid).toBe(true);
        expect(validateQuotaEvaluation({ ...denied, blocking_reasons: [] }).isValid).toBe(false);
    });
    it("15/16 - BonusEligibility valid and eligible-with-reasons invalid", () => {
        const eligibility = createBonusEligibility({
            id: createBonusEligibilityId("vbe_validbonuselig01"),
            version: createVersion("v1.0.0"),
            target_owner_ref: createOwnerRef("user:beta"),
            bonus_type: BonusType.WELCOME_BONUS,
            eligibility_status: EligibilityStatus.ELIGIBLE,
            evaluated_at: now,
            blocking_reasons: [],
            supporting_refs: [createRelatedRef("signal:1")],
        });
        expect(validateBonusEligibility(eligibility).isValid).toBe(true);
        expect(validateBonusEligibility({ ...eligibility, blocking_reasons: [createNote("x")] }).isValid).toBe(false);
    });
    it("17/18 - AdminCreditAdjustment valid and missing audit_ref invalid", () => {
        const adjustment = createAdminCreditAdjustment({
            id: createAdminCreditAdjustmentId("vaa_validadjust0001"),
            version: createVersion("v1.0.0"),
            target_account_id: buildValidAccount().id,
            adjustment_type: AdjustmentType.MANUAL_INCREASE,
            amount_delta: 10,
            initiated_by: createRelatedRef("admin:1"),
            initiated_at: now,
            adjustment_reason: createAdjustmentReason("support compensation"),
            audit_ref: createAuditRef("audit:adj:1"),
            applied_status: AppliedStatus.PENDING,
        });
        expect(validateAdminCreditAdjustment(adjustment).isValid).toBe(true);
        expect(validateAdminCreditAdjustment({ ...adjustment, audit_ref: "" }).isValid).toBe(false);
    });
    it("19 - valid AbuseRiskFlag", () => {
        const risk = createAbuseRiskFlag({
            id: createAbuseRiskFlagId("var_validriskflag001"),
            version: createVersion("v1.0.0"),
            target_owner_ref: createOwnerRef("user:gamma"),
            risk_type: RiskType.REPEATED_DENIED_ATTEMPTS,
            severity: RiskSeverity.MEDIUM,
            detected_at: now,
            related_refs: [createRelatedRef("denied:1")],
            active: true,
            mitigation_notes_nullable: null,
        });
        expect(validateAbuseRiskFlag(risk).isValid).toBe(true);
    });
});
//# sourceMappingURL=virtual-credits.spec.js.map