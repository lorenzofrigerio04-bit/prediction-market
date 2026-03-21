import type { SourceKey } from "../../value-objects/source-key.vo.js";
import type { GovernanceSource } from "../entities/governance-source.entity.js";
import type { GovernanceSourceRegistry } from "../interfaces/governance-source-registry.js";
export declare class DeterministicGovernanceSourceRegistry implements GovernanceSourceRegistry {
    private readonly byKey;
    register(source: GovernanceSource): GovernanceSource;
    getByKey(sourceKey: SourceKey): GovernanceSource | null;
    list(): readonly GovernanceSource[];
}
//# sourceMappingURL=deterministic-governance-source-registry.d.ts.map