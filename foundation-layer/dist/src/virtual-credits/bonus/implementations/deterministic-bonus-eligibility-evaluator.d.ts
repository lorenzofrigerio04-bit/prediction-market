import { BonusType } from "../../enums/bonus-type.enum.js";
import type { BonusEligibility } from "../entities/bonus-eligibility.entity.js";
import type { BonusEligibilityContext, BonusEligibilityEvaluator } from "../interfaces/bonus-eligibility-evaluator.js";
import { type OwnerRef } from "../../value-objects/index.js";
export declare class DeterministicBonusEligibilityEvaluator implements BonusEligibilityEvaluator {
    evaluateWelcomeBonus(targetOwnerRef: OwnerRef, context: BonusEligibilityContext): BonusEligibility;
    evaluateBonusEligibility(bonusType: BonusType, targetOwnerRef: OwnerRef, context: BonusEligibilityContext): BonusEligibility;
}
//# sourceMappingURL=deterministic-bonus-eligibility-evaluator.d.ts.map