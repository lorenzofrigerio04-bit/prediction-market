import type { CapabilityPolicyAdapter } from "../interfaces/capability-policy-adapter.js";
import type { CapabilityFlagKey } from "../../value-objects/capability-flag-key.vo.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";

const SENSITIVE_CAPABILITY_PREFIXES = ["sensitive.", "admin.", "root."] as const;

export class DeterministicCapabilityPolicyAdapter implements CapabilityPolicyAdapter {
  private readonly grants: ReadonlyMap<UserIdentityId, ReadonlySet<CapabilityFlagKey>>;

  constructor(input: ReadonlyMap<UserIdentityId, ReadonlySet<CapabilityFlagKey>>) {
    this.grants = input;
  }

  isCapabilityGranted(userId: UserIdentityId, capabilityKey: CapabilityFlagKey): boolean {
    const granted = this.grants.get(userId);
    if (granted === undefined) {
      return false;
    }
    const keyText = capabilityKey as string;
    const isSensitive = SENSITIVE_CAPABILITY_PREFIXES.some((prefix) => keyText.startsWith(prefix));
    if (isSensitive && !granted.has(capabilityKey)) {
      // Security hardening: sensitive flags are never implicitly granted.
      return false;
    }
    return granted.has(capabilityKey);
  }
}
