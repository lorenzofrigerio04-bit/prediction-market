export class DeterministicGovernanceSourceRegistry {
    byKey = new Map();
    register(source) {
        this.byKey.set(source.source_key, source);
        return source;
    }
    getByKey(sourceKey) {
        return this.byKey.get(sourceKey) ?? null;
    }
    list() {
        return [...this.byKey.values()];
    }
}
//# sourceMappingURL=deterministic-governance-source-registry.js.map