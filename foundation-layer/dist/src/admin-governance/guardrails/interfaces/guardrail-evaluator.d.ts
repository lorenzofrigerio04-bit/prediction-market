import type { GuardrailPolicy } from "../entities/guardrail-policy.entity.js";
import type { ModuleKey, OperationKey } from "../../value-objects/index.js";
export interface GuardrailEvaluator {
    addPolicy(policy: GuardrailPolicy): GuardrailPolicy;
    evaluate(moduleKey: ModuleKey, operationKey: OperationKey): readonly GuardrailPolicy[];
}
//# sourceMappingURL=guardrail-evaluator.d.ts.map