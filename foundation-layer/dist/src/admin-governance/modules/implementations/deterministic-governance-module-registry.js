export class DeterministicGovernanceModuleRegistry {
    byKey = new Map();
    register(module) {
        this.byKey.set(module.module_key, module);
        return module;
    }
    getByKey(moduleKey) {
        return this.byKey.get(moduleKey) ?? null;
    }
    list() {
        return [...this.byKey.values()];
    }
}
//# sourceMappingURL=deterministic-governance-module-registry.js.map