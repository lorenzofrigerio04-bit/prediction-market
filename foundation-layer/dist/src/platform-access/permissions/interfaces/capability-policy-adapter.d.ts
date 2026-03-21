import type { CapabilityFlagKey } from "../../value-objects/capability-flag-key.vo.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";
export interface CapabilityPolicyAdapter {
    isCapabilityGranted(userId: UserIdentityId, capabilityKey: CapabilityFlagKey): boolean;
}
//# sourceMappingURL=capability-policy-adapter.d.ts.map