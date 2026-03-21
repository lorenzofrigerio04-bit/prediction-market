import type { AbuseRiskFlag } from "../entities/abuse-risk-flag.entity.js";
import type { AbuseRiskContext, AbuseRiskEvaluator } from "../interfaces/abuse-risk-evaluator.js";
import type { CreditConsumptionEvent } from "../../consumption/entities/credit-consumption-event.entity.js";
import type { CreditGrant } from "../../grants/entities/credit-grant.entity.js";
import { type OwnerRef } from "../../value-objects/index.js";
export declare class DeterministicAbuseRiskEvaluator implements AbuseRiskEvaluator {
    evaluateOwnerRisk(targetOwnerRef: OwnerRef, context: AbuseRiskContext): AbuseRiskFlag;
    evaluateConsumptionRisk(consumptionEvent: CreditConsumptionEvent, context: AbuseRiskContext): AbuseRiskFlag;
    evaluateGrantRisk(grant: CreditGrant, context: AbuseRiskContext): AbuseRiskFlag;
}
//# sourceMappingURL=deterministic-abuse-risk-evaluator.d.ts.map