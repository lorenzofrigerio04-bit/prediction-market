import type { GovernanceModuleId } from "../../value-objects/admin-governance-ids.vo.js";
import type { GovernanceEnvironmentBinding } from "../entities/governance-environment-binding.entity.js";
import type { EnvironmentGovernanceBuilder } from "../interfaces/environment-governance-builder.js";
export declare class DeterministicEnvironmentGovernanceBuilder implements EnvironmentGovernanceBuilder {
    private readonly byModule;
    upsert(binding: GovernanceEnvironmentBinding): GovernanceEnvironmentBinding;
    getForModule(moduleId: GovernanceModuleId): readonly GovernanceEnvironmentBinding[];
}
//# sourceMappingURL=deterministic-environment-governance-builder.d.ts.map