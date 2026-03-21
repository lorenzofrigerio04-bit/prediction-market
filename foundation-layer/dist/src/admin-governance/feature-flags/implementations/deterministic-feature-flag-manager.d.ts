import type { FeatureFlagKey } from "../../value-objects/feature-flag-key.vo.js";
import type { AdminFeatureFlag } from "../entities/admin-feature-flag.entity.js";
import type { FeatureFlagManager } from "../interfaces/feature-flag-manager.js";
export declare class DeterministicFeatureFlagManager implements FeatureFlagManager {
    private readonly byKey;
    upsert(flag: AdminFeatureFlag): AdminFeatureFlag;
    getByKey(flagKey: FeatureFlagKey): AdminFeatureFlag | null;
    list(): readonly AdminFeatureFlag[];
}
//# sourceMappingURL=deterministic-feature-flag-manager.d.ts.map