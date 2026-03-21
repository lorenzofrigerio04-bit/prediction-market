import type { GovernanceModule } from "../entities/governance-module.entity.js";
import type { ModuleKey } from "../../value-objects/module-key.vo.js";

export interface GovernanceModuleRegistry {
  register(module: GovernanceModule): GovernanceModule;
  getByKey(moduleKey: ModuleKey): GovernanceModule | null;
  list(): readonly GovernanceModule[];
}
