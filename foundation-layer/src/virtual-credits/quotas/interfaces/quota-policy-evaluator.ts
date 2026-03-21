import type { QuotaEvaluation } from "../entities/quota-evaluation.entity.js";
import type { QuotaPolicy } from "../entities/quota-policy.entity.js";
import type { ActionKey, VirtualCreditAccountId } from "../../value-objects/index.js";

export type QuotaEvaluationContext = Readonly<{
  policies: readonly QuotaPolicy[];
  current_usage: number;
  requested_usage: number;
  action_key: ActionKey;
  target_account_id: VirtualCreditAccountId;
}>;

export interface QuotaPolicyEvaluator {
  evaluate(
    policy: QuotaPolicy,
    currentUsage: number,
    requestedUsage: number,
    actionKey: ActionKey,
    targetAccountId: VirtualCreditAccountId,
  ): QuotaEvaluation;
  evaluateMany(policies: readonly QuotaPolicy[], context: QuotaEvaluationContext): readonly QuotaEvaluation[];
}
