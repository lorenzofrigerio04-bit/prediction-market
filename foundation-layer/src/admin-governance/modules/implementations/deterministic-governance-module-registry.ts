import type { ModuleKey } from "../../value-objects/module-key.vo.js";
import type { GovernanceModule } from "../entities/governance-module.entity.js";
import type { GovernanceModuleRegistry } from "../interfaces/governance-module-registry.js";

export class DeterministicGovernanceModuleRegistry implements GovernanceModuleRegistry {
  private readonly byKey = new Map<ModuleKey, GovernanceModule>();

  register(module: GovernanceModule): GovernanceModule {
    this.byKey.set(module.module_key, module);
    return module;
  }

  getByKey(moduleKey: ModuleKey): GovernanceModule | null {
    return this.byKey.get(moduleKey) ?? null;
  }

  list(): readonly GovernanceModule[] {
    return [...this.byKey.values()];
  }
}
