import type { GovernanceSource } from "../entities/governance-source.entity.js";
import type { SourceKey } from "../../value-objects/source-key.vo.js";
export interface GovernanceSourceRegistry {
    register(source: GovernanceSource): GovernanceSource;
    getByKey(sourceKey: SourceKey): GovernanceSource | null;
    list(): readonly GovernanceSource[];
}
//# sourceMappingURL=governance-source-registry.d.ts.map