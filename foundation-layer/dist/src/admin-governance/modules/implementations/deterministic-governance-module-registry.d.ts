import type { ModuleKey } from "../../value-objects/module-key.vo.js";
import type { GovernanceModule } from "../entities/governance-module.entity.js";
import type { GovernanceModuleRegistry } from "../interfaces/governance-module-registry.js";
export declare class DeterministicGovernanceModuleRegistry implements GovernanceModuleRegistry {
    private readonly byKey;
    register(module: GovernanceModule): GovernanceModule;
    getByKey(moduleKey: ModuleKey): GovernanceModule | null;
    list(): readonly GovernanceModule[];
}
//# sourceMappingURL=deterministic-governance-module-registry.d.ts.map