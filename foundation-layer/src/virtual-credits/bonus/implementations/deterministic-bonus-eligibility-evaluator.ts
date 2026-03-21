import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { BonusType } from "../../enums/bonus-type.enum.js";
import { EligibilityStatus } from "../../enums/eligibility-status.enum.js";
import { createBonusEligibility } from "../entities/bonus-eligibility.entity.js";
import type { BonusEligibility } from "../entities/bonus-eligibility.entity.js";
import type { BonusEligibilityContext, BonusEligibilityEvaluator } from "../interfaces/bonus-eligibility-evaluator.js";
import { createBonusEligibilityId, createNote, createRelatedRef, createVersion, type OwnerRef } from "../../value-objects/index.js";

export class DeterministicBonusEligibilityEvaluator implements BonusEligibilityEvaluator {
  evaluateWelcomeBonus(targetOwnerRef: OwnerRef, context: BonusEligibilityContext): BonusEligibility {
    return this.evaluateBonusEligibility(BonusType.WELCOME_BONUS, targetOwnerRef, context);
  }

  evaluateBonusEligibility(
    bonusType: BonusType,
    targetOwnerRef: OwnerRef,
    context: BonusEligibilityContext,
  ): BonusEligibility {
    let status = EligibilityStatus.ELIGIBLE;
    const reasons = [];
    if (context.has_previous_claim) {
      status = EligibilityStatus.ALREADY_CLAIMED;
      reasons.push(createNote("bonus already claimed"));
    }
    if (context.active_risk_flags.length > 0) {
      status = EligibilityStatus.BLOCKED;
      reasons.push(createNote("active abuse risk detected"));
    }
    return createBonusEligibility({
      id: createBonusEligibilityId("vbe_defaultrule0001"),
      version: createVersion("v1.0.0"),
      target_owner_ref: targetOwnerRef,
      bonus_type: bonusType,
      eligibility_status: status,
      evaluated_at: createTimestamp("1970-01-01T00:00:00.000Z"),
      blocking_reasons: reasons,
      supporting_refs: context.ownership_signals.map((item) => createRelatedRef(item)),
    });
  }
}
