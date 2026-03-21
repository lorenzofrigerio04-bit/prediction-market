import type { ModuleKey, OperationKey } from "../../value-objects/index.js";
import type { GuardrailPolicy } from "../entities/guardrail-policy.entity.js";
import type { GuardrailEvaluator } from "../interfaces/guardrail-evaluator.js";

export class DeterministicGuardrailEvaluator implements GuardrailEvaluator {
  private readonly items: GuardrailPolicy[] = [];

  addPolicy(policy: GuardrailPolicy): GuardrailPolicy {
    this.items.push(policy);
    return policy;
  }

  evaluate(moduleKey: ModuleKey, operationKey: OperationKey): readonly GuardrailPolicy[] {
    return this.items.filter((policy) => policy.active && policy.module_key === moduleKey && policy.operation_key === operationKey);
  }
}
