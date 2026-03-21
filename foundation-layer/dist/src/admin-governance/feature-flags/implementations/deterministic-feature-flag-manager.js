export class DeterministicFeatureFlagManager {
    byKey = new Map();
    upsert(flag) {
        this.byKey.set(flag.flag_key, flag);
        return flag;
    }
    getByKey(flagKey) {
        return this.byKey.get(flagKey) ?? null;
    }
    list() {
        return [...this.byKey.values()];
    }
}
//# sourceMappingURL=deterministic-feature-flag-manager.js.map