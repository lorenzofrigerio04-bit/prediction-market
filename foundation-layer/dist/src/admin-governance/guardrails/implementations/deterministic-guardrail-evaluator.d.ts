import type { ModuleKey, OperationKey } from "../../value-objects/index.js";
import type { GuardrailPolicy } from "../entities/guardrail-policy.entity.js";
import type { GuardrailEvaluator } from "../interfaces/guardrail-evaluator.js";
export declare class DeterministicGuardrailEvaluator implements GuardrailEvaluator {
    private readonly items;
    addPolicy(policy: GuardrailPolicy): GuardrailPolicy;
    evaluate(moduleKey: ModuleKey, operationKey: OperationKey): readonly GuardrailPolicy[];
}
//# sourceMappingURL=deterministic-guardrail-evaluator.d.ts.map