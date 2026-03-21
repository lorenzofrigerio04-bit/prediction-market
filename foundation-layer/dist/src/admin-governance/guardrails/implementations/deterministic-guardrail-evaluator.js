export class DeterministicGuardrailEvaluator {
    items = [];
    addPolicy(policy) {
        this.items.push(policy);
        return policy;
    }
    evaluate(moduleKey, operationKey) {
        return this.items.filter((policy) => policy.active && policy.module_key === moduleKey && policy.operation_key === operationKey);
    }
}
//# sourceMappingURL=deterministic-guardrail-evaluator.js.map