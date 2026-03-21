import type { GovernanceModuleId } from "../../value-objects/admin-governance-ids.vo.js";
import type { GovernanceEnvironmentBinding } from "../entities/governance-environment-binding.entity.js";
import type { EnvironmentGovernanceBuilder } from "../interfaces/environment-governance-builder.js";

export class DeterministicEnvironmentGovernanceBuilder implements EnvironmentGovernanceBuilder {
  private readonly byModule = new Map<GovernanceModuleId, GovernanceEnvironmentBinding[]>();

  upsert(binding: GovernanceEnvironmentBinding): GovernanceEnvironmentBinding {
    const existing = this.byModule.get(binding.module_id) ?? [];
    const filtered = existing.filter((item) => item.environment_key !== binding.environment_key);
    this.byModule.set(binding.module_id, [...filtered, binding]);
    return binding;
  }

  getForModule(moduleId: GovernanceModuleId): readonly GovernanceEnvironmentBinding[] {
    return this.byModule.get(moduleId) ?? [];
  }
}
