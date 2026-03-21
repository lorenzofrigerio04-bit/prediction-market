export class DeterministicGovernanceDecisionRecorder {
    byId = new Map();
    record(decision) {
        this.byId.set(decision.id, decision);
        return decision;
    }
    getById(decisionId) {
        return this.byId.get(decisionId) ?? null;
    }
    listByModule(moduleId) {
        return [...this.byId.values()].filter((decision) => decision.module_id === moduleId);
    }
}
//# sourceMappingURL=deterministic-governance-decision-recorder.js.map