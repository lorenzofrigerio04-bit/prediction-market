export class DeterministicEnvironmentGovernanceBuilder {
    byModule = new Map();
    upsert(binding) {
        const existing = this.byModule.get(binding.module_id) ?? [];
        const filtered = existing.filter((item) => item.environment_key !== binding.environment_key);
        this.byModule.set(binding.module_id, [...filtered, binding]);
        return binding;
    }
    getForModule(moduleId) {
        return this.byModule.get(moduleId) ?? [];
    }
}
//# sourceMappingURL=deterministic-environment-governance-builder.js.map