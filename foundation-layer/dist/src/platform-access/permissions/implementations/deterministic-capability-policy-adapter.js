const SENSITIVE_CAPABILITY_PREFIXES = ["sensitive.", "admin.", "root."];
export class DeterministicCapabilityPolicyAdapter {
    grants;
    constructor(input) {
        this.grants = input;
    }
    isCapabilityGranted(userId, capabilityKey) {
        const granted = this.grants.get(userId);
        if (granted === undefined) {
            return false;
        }
        const keyText = capabilityKey;
        const isSensitive = SENSITIVE_CAPABILITY_PREFIXES.some((prefix) => keyText.startsWith(prefix));
        if (isSensitive && !granted.has(capabilityKey)) {
            // Security hardening: sensitive flags are never implicitly granted.
            return false;
        }
        return granted.has(capabilityKey);
    }
}
//# sourceMappingURL=deterministic-capability-policy-adapter.js.map