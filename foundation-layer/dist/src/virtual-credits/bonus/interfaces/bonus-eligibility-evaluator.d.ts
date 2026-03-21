import type { BonusEligibility } from "../entities/bonus-eligibility.entity.js";
import type { BonusType } from "../../enums/bonus-type.enum.js";
import type { OwnerRef } from "../../value-objects/index.js";
export type BonusEligibilityContext = Readonly<{
    has_previous_claim: boolean;
    active_risk_flags: readonly string[];
    ownership_signals: readonly string[];
}>;
export interface BonusEligibilityEvaluator {
    evaluateWelcomeBonus(targetOwnerRef: OwnerRef, context: BonusEligibilityContext): BonusEligibility;
    evaluateBonusEligibility(bonusType: BonusType, targetOwnerRef: OwnerRef, context: BonusEligibilityContext): BonusEligibility;
}
//# sourceMappingURL=bonus-eligibility-evaluator.d.ts.map