import type { OperationKey } from "../../value-objects/index.js";
export type VirtualCreditsGovernanceGuard = Readonly<{
    denied_operations: readonly OperationKey[];
}>;
export declare const createVirtualCreditsGovernanceGuard: (input: VirtualCreditsGovernanceGuard) => VirtualCreditsGovernanceGuard;
//# sourceMappingURL=virtual-credits-governance-guard.entity.d.ts.map