import type { FeatureFlagKey } from "../../value-objects/feature-flag-key.vo.js";
import type { AdminFeatureFlag } from "../entities/admin-feature-flag.entity.js";
import type { FeatureFlagManager } from "../interfaces/feature-flag-manager.js";

export class DeterministicFeatureFlagManager implements FeatureFlagManager {
  private readonly byKey = new Map<FeatureFlagKey, AdminFeatureFlag>();

  upsert(flag: AdminFeatureFlag): AdminFeatureFlag {
    this.byKey.set(flag.flag_key, flag);
    return flag;
  }

  getByKey(flagKey: FeatureFlagKey): AdminFeatureFlag | null {
    return this.byKey.get(flagKey) ?? null;
  }

  list(): readonly AdminFeatureFlag[] {
    return [...this.byKey.values()];
  }
}
