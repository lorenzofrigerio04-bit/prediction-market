import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { EnforcementMode } from "../../enums/enforcement-mode.enum.js";
import { QuotaDecisionStatus } from "../../enums/quota-decision-status.enum.js";
import { createQuotaEvaluation } from "../entities/quota-evaluation.entity.js";
import type { QuotaEvaluation } from "../entities/quota-evaluation.entity.js";
import type { QuotaPolicy } from "../entities/quota-policy.entity.js";
import type { QuotaPolicyEvaluator, QuotaEvaluationContext } from "../interfaces/quota-policy-evaluator.js";
import { createNote, createQuotaEvaluationId, createVersion, type ActionKey, type VirtualCreditAccountId } from "../../value-objects/index.js";

const decide = (policy: QuotaPolicy, current: number, requested: number): QuotaDecisionStatus => {
  if (!policy.active) {
    return QuotaDecisionStatus.SKIPPED;
  }
  if (!Number.isFinite(current) || !Number.isFinite(requested)) {
    return policy.enforcement_mode === EnforcementMode.OBSERVE_ONLY
      ? QuotaDecisionStatus.WARNED
      : QuotaDecisionStatus.DENIED;
  }
  const projected = current + requested;
  if (projected <= policy.max_amount) {
    return QuotaDecisionStatus.ALLOWED;
  }
  if (policy.enforcement_mode === EnforcementMode.SOFT_WARN || policy.enforcement_mode === EnforcementMode.OBSERVE_ONLY) {
    return QuotaDecisionStatus.WARNED;
  }
  return QuotaDecisionStatus.DENIED;
};

export class DeterministicQuotaPolicyEvaluator implements QuotaPolicyEvaluator {
  evaluate(
    policy: QuotaPolicy,
    currentUsage: number,
    requestedUsage: number,
    actionKey: ActionKey,
    targetAccountId: VirtualCreditAccountId,
  ): QuotaEvaluation {
    const decision = decide(policy, currentUsage, requestedUsage);
    const reasons = decision === QuotaDecisionStatus.DENIED
      ? [createNote("quota exceeded under hard block")]
      : decision === QuotaDecisionStatus.WARNED
        ? [createNote("quota threshold reached in warn/observe mode")]
        : [];
    return createQuotaEvaluation({
      id: createQuotaEvaluationId("vqe_defaultpolicy001"),
      version: createVersion("v1.0.0"),
      policy_id: policy.id,
      target_account_id: targetAccountId,
      evaluated_action_key: actionKey,
      current_usage: currentUsage,
      requested_usage: requestedUsage,
      decision_status: decision,
      blocking_reasons: reasons,
      evaluated_at: createTimestamp("1970-01-01T00:00:00.000Z"),
    });
  }

  evaluateMany(policies: readonly QuotaPolicy[], context: QuotaEvaluationContext): readonly QuotaEvaluation[] {
    return policies.map((policy) =>
      this.evaluate(
        policy,
        context.current_usage,
        context.requested_usage,
        context.action_key,
        context.target_account_id,
      ),
    );
  }
}
