import type { AdminFeatureFlag } from "../entities/admin-feature-flag.entity.js";
import type { FeatureFlagKey } from "../../value-objects/feature-flag-key.vo.js";
export interface FeatureFlagManager {
    upsert(flag: AdminFeatureFlag): AdminFeatureFlag;
    getByKey(flagKey: FeatureFlagKey): AdminFeatureFlag | null;
    list(): readonly AdminFeatureFlag[];
}
//# sourceMappingURL=feature-flag-manager.d.ts.map