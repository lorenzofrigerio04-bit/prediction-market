import type { AbuseRiskFlag } from "../entities/abuse-risk-flag.entity.js";
import type { CreditConsumptionEvent } from "../../consumption/entities/credit-consumption-event.entity.js";
import type { CreditGrant } from "../../grants/entities/credit-grant.entity.js";
import type { OwnerRef } from "../../value-objects/index.js";
export type AbuseRiskContext = Readonly<{
    denied_attempts: number;
    recent_consumption_total: number;
    recent_grants_total: number;
    linked_owner_refs: readonly string[];
}>;
export interface AbuseRiskEvaluator {
    evaluateOwnerRisk(targetOwnerRef: OwnerRef, context: AbuseRiskContext): AbuseRiskFlag;
    evaluateConsumptionRisk(consumptionEvent: CreditConsumptionEvent, context: AbuseRiskContext): AbuseRiskFlag;
    evaluateGrantRisk(grant: CreditGrant, context: AbuseRiskContext): AbuseRiskFlag;
}
//# sourceMappingURL=abuse-risk-evaluator.d.ts.map