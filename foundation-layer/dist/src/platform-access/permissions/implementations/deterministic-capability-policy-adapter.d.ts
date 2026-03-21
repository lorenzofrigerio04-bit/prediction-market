import type { CapabilityPolicyAdapter } from "../interfaces/capability-policy-adapter.js";
import type { CapabilityFlagKey } from "../../value-objects/capability-flag-key.vo.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";
export declare class DeterministicCapabilityPolicyAdapter implements CapabilityPolicyAdapter {
    private readonly grants;
    constructor(input: ReadonlyMap<UserIdentityId, ReadonlySet<CapabilityFlagKey>>);
    isCapabilityGranted(userId: UserIdentityId, capabilityKey: CapabilityFlagKey): boolean;
}
//# sourceMappingURL=deterministic-capability-policy-adapter.d.ts.map