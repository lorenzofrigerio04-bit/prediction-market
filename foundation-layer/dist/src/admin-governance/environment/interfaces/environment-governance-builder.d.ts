import type { GovernanceEnvironmentBinding } from "../entities/governance-environment-binding.entity.js";
import type { GovernanceModuleId } from "../../value-objects/admin-governance-ids.vo.js";
export interface EnvironmentGovernanceBuilder {
    upsert(binding: GovernanceEnvironmentBinding): GovernanceEnvironmentBinding;
    getForModule(moduleId: GovernanceModuleId): readonly GovernanceEnvironmentBinding[];
}
//# sourceMappingURL=environment-governance-builder.d.ts.map