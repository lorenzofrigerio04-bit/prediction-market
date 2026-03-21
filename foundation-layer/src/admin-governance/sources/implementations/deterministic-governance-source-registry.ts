import type { SourceKey } from "../../value-objects/source-key.vo.js";
import type { GovernanceSource } from "../entities/governance-source.entity.js";
import type { GovernanceSourceRegistry } from "../interfaces/governance-source-registry.js";

export class DeterministicGovernanceSourceRegistry implements GovernanceSourceRegistry {
  private readonly byKey = new Map<SourceKey, GovernanceSource>();

  register(source: GovernanceSource): GovernanceSource {
    this.byKey.set(source.source_key, source);
    return source;
  }

  getByKey(sourceKey: SourceKey): GovernanceSource | null {
    return this.byKey.get(sourceKey) ?? null;
  }

  list(): readonly GovernanceSource[] {
    return [...this.byKey.values()];
  }
}
