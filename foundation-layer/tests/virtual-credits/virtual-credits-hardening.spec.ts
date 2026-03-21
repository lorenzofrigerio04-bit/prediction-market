import { describe, expect, it } from "vitest";
import { requireSchemaValidator } from "../../src/validators/common/validation-result.js";
import * as foundation from "../../src/index.js";
import {
  ABUSE_RISK_FLAG_SCHEMA_ID,
  ADMIN_CREDIT_ADJUSTMENT_SCHEMA_ID,
  BONUS_ELIGIBILITY_SCHEMA_ID,
  CREDIT_BALANCE_SNAPSHOT_SCHEMA_ID,
  CREDIT_CONSUMPTION_EVENT_SCHEMA_ID,
  CREDIT_GRANT_SCHEMA_ID,
  CREDIT_LEDGER_ENTRY_SCHEMA_ID,
  CREDITS_COMPATIBILITY_VIEW_SCHEMA_ID,
  createAbuseRiskFlag,
  createAbuseRiskFlagId,
  createCorrelationId,
  createCreditLedgerEntry,
  createCreditLedgerEntryId,
  createOwnerRef,
  createRelatedRef,
  createVersion,
  createVirtualCreditAccountId,
  DeterministicAbuseRiskEvaluator,
  DeterministicBalanceSnapshotBuilder,
  LedgerEntryType,
  QUOTA_EVALUATION_SCHEMA_ID,
  QUOTA_POLICY_SCHEMA_ID,
  RiskSeverity,
  RiskType,
  USAGE_COUNTER_SCHEMA_ID,
  validateCreditAuditChain,
  validateVirtualCreditsFamilyAggregate,
  VIRTUAL_CREDIT_ACCOUNT_SCHEMA_ID,
} from "../../src/virtual-credits/index.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";

describe("virtual-credits hardening", () => {
  it("registers every virtual-credit schema in AJV", () => {
    const ids = [
      VIRTUAL_CREDIT_ACCOUNT_SCHEMA_ID,
      CREDIT_GRANT_SCHEMA_ID,
      CREDIT_LEDGER_ENTRY_SCHEMA_ID,
      CREDIT_CONSUMPTION_EVENT_SCHEMA_ID,
      CREDIT_BALANCE_SNAPSHOT_SCHEMA_ID,
      QUOTA_POLICY_SCHEMA_ID,
      QUOTA_EVALUATION_SCHEMA_ID,
      USAGE_COUNTER_SCHEMA_ID,
      BONUS_ELIGIBILITY_SCHEMA_ID,
      ADMIN_CREDIT_ADJUSTMENT_SCHEMA_ID,
      ABUSE_RISK_FLAG_SCHEMA_ID,
      CREDITS_COMPATIBILITY_VIEW_SCHEMA_ID,
    ];
    for (const schemaId of ids) {
      expect(() => requireSchemaValidator(schemaId)).not.toThrow();
    }
  });

  it("preserves root and namespace exports", () => {
    expect(typeof foundation.validateCreditGrant).toBe("function");
    expect(typeof foundation.virtualCredits.validateCreditGrant).toBe("function");
    expect(Array.isArray(foundation.virtualCredits.virtualCreditSchemas)).toBe(true);
  });

  it("ledger audit chain catches missing correlation id", () => {
    const entry = createCreditLedgerEntry({
      id: createCreditLedgerEntryId("vcl_auditchaincase01"),
      version: createVersion("v1.0.0"),
      account_id: createVirtualCreditAccountId("vca_hardeningacct001"),
      entry_type: LedgerEntryType.GRANT_ISSUED,
      amount_delta: 10,
      resulting_balance_nullable: null,
      correlation_id: createCorrelationId("corr:1"),
      caused_by_ref: createRelatedRef("grant:1"),
      created_at: createTimestamp("2026-01-01T00:00:00.000Z"),
      immutable: true,
    });
    const report = validateCreditAuditChain([{ ...entry, correlation_id: "" as ReturnType<typeof createCorrelationId> }]);
    expect(report.isValid).toBe(false);
  });

  it("snapshot builder degrades consistency on non-immutable refs", () => {
    const builder = new DeterministicBalanceSnapshotBuilder();
    const accountId = createVirtualCreditAccountId("vca_snapshotacct001");
    const snapshot = builder.buildSnapshot(accountId, [
      createCreditLedgerEntry({
        id: createCreditLedgerEntryId("vcl_snapshotentry001"),
        version: createVersion("v1.0.0"),
        account_id: accountId,
        entry_type: LedgerEntryType.SNAPSHOT_CORRECTION,
        amount_delta: 0.1,
        resulting_balance_nullable: 0.1,
        correlation_id: createCorrelationId("corr:snap:1"),
        caused_by_ref: createRelatedRef("snapshot:1"),
        created_at: createTimestamp("2026-01-01T00:00:00.000Z"),
        immutable: false,
      }),
    ]);
    expect(snapshot.consistency_status).not.toBe("CONSISTENT");
  });

  it("abuse evaluator flags repeated denied attempts", () => {
    const evaluator = new DeterministicAbuseRiskEvaluator();
    const flag = evaluator.evaluateOwnerRisk(createOwnerRef("user:risky"), {
      denied_attempts: 8,
      recent_consumption_total: 0,
      recent_grants_total: 0,
      linked_owner_refs: ["user:risky"],
    });
    expect(flag.risk_type).toBe(RiskType.REPEATED_DENIED_ATTEMPTS);
    expect([RiskSeverity.MEDIUM, RiskSeverity.HIGH, RiskSeverity.CRITICAL]).toContain(flag.severity);
  });

  it("no payment semantics leakage in public surface", () => {
    const text = Object.keys(foundation.virtualCredits).join(" ").toLowerCase();
    expect(text.includes("invoice")).toBe(false);
    expect(text.includes("subscription")).toBe(false);
    expect(text.includes("stripe")).toBe(false);
  });

  it("aggregate validator can run on empty family", () => {
    const report = validateVirtualCreditsFamilyAggregate({
      accounts: [],
      grants: [],
      ledgerEntries: [],
      quotaPolicies: [],
    });
    expect(report.issues).toBeDefined();
  });

  it("abuse flag validator allows active with explicit refs", () => {
    const flag = createAbuseRiskFlag({
      id: createAbuseRiskFlagId("var_hardeningflag001"),
      version: createVersion("v1.0.0"),
      target_owner_ref: createOwnerRef("user:abuse"),
      risk_type: RiskType.GRANT_ABUSE,
      severity: RiskSeverity.HIGH,
      detected_at: createTimestamp("2026-01-01T00:00:00.000Z"),
      related_refs: [createRelatedRef("grant:abusive")],
      active: true,
      mitigation_notes_nullable: null,
    });
    expect(flag.active).toBe(true);
  });
});
