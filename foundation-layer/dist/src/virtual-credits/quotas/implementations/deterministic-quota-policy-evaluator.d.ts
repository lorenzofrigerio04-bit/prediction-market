import type { QuotaEvaluation } from "../entities/quota-evaluation.entity.js";
import type { QuotaPolicy } from "../entities/quota-policy.entity.js";
import type { QuotaPolicyEvaluator, QuotaEvaluationContext } from "../interfaces/quota-policy-evaluator.js";
import { type ActionKey, type VirtualCreditAccountId } from "../../value-objects/index.js";
export declare class DeterministicQuotaPolicyEvaluator implements QuotaPolicyEvaluator {
    evaluate(policy: QuotaPolicy, currentUsage: number, requestedUsage: number, actionKey: ActionKey, targetAccountId: VirtualCreditAccountId): QuotaEvaluation;
    evaluateMany(policies: readonly QuotaPolicy[], context: QuotaEvaluationContext): readonly QuotaEvaluation[];
}
//# sourceMappingURL=deterministic-quota-policy-evaluator.d.ts.map