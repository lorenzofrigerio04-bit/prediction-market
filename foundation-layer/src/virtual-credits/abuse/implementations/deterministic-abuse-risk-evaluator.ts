import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { RiskSeverity } from "../../enums/risk-severity.enum.js";
import { RiskType } from "../../enums/risk-type.enum.js";
import { createAbuseRiskFlag } from "../entities/abuse-risk-flag.entity.js";
import type { AbuseRiskFlag } from "../entities/abuse-risk-flag.entity.js";
import type { AbuseRiskContext, AbuseRiskEvaluator } from "../interfaces/abuse-risk-evaluator.js";
import type { CreditConsumptionEvent } from "../../consumption/entities/credit-consumption-event.entity.js";
import type { CreditGrant } from "../../grants/entities/credit-grant.entity.js";
import {
  createAbuseRiskFlagId,
  createOwnerRef,
  createRelatedRef,
  createVersion,
  type OwnerRef,
} from "../../value-objects/index.js";

const severityByDeniedAttempts = (denied: number): RiskSeverity => {
  if (denied >= 20) return RiskSeverity.CRITICAL;
  if (denied >= 10) return RiskSeverity.HIGH;
  if (denied >= 5) return RiskSeverity.MEDIUM;
  return RiskSeverity.LOW;
};

export class DeterministicAbuseRiskEvaluator implements AbuseRiskEvaluator {
  evaluateOwnerRisk(targetOwnerRef: OwnerRef, context: AbuseRiskContext): AbuseRiskFlag {
    const riskType = context.denied_attempts >= 5 ? RiskType.REPEATED_DENIED_ATTEMPTS : RiskType.ANOMALOUS_CONSUMPTION;
    return createAbuseRiskFlag({
      id: createAbuseRiskFlagId("var_ownerriskeval001"),
      version: createVersion("v1.0.0"),
      target_owner_ref: targetOwnerRef,
      risk_type: riskType,
      severity: severityByDeniedAttempts(context.denied_attempts),
      detected_at: createTimestamp("1970-01-01T00:00:00.000Z"),
      related_refs: context.linked_owner_refs.map((item) => createRelatedRef(item)),
      active: context.denied_attempts > 0,
      mitigation_notes_nullable: null,
    });
  }

  evaluateConsumptionRisk(consumptionEvent: CreditConsumptionEvent, context: AbuseRiskContext): AbuseRiskFlag {
    return createAbuseRiskFlag({
      id: createAbuseRiskFlagId("var_consumptionrisk01"),
      version: createVersion("v1.0.0"),
      target_owner_ref: createOwnerRef(`account:${consumptionEvent.account_id}`),
      risk_type: RiskType.ANOMALOUS_CONSUMPTION,
      severity: context.recent_consumption_total > 10000 ? RiskSeverity.HIGH : RiskSeverity.MEDIUM,
      detected_at: createTimestamp("1970-01-01T00:00:00.000Z"),
      related_refs: [createRelatedRef(consumptionEvent.id)],
      active: true,
      mitigation_notes_nullable: null,
    });
  }

  evaluateGrantRisk(grant: CreditGrant, context: AbuseRiskContext): AbuseRiskFlag {
    return createAbuseRiskFlag({
      id: createAbuseRiskFlagId("var_grantriskeval001"),
      version: createVersion("v1.0.0"),
      target_owner_ref: createOwnerRef(`account:${grant.target_account_id}`),
      risk_type: context.linked_owner_refs.length > 2 ? RiskType.MULTI_ACCOUNT_BONUS_ABUSE : RiskType.GRANT_ABUSE,
      severity: context.recent_grants_total > 10000 ? RiskSeverity.CRITICAL : RiskSeverity.MEDIUM,
      detected_at: createTimestamp("1970-01-01T00:00:00.000Z"),
      related_refs: [createRelatedRef(grant.id)],
      active: true,
      mitigation_notes_nullable: null,
    });
  }
}
