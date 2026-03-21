import type { OperationKey } from "../../value-objects/index.js";
export type ReliabilityGovernanceGuard = Readonly<{
    denied_operations: readonly OperationKey[];
}>;
export declare const createReliabilityGovernanceGuard: (input: ReliabilityGovernanceGuard) => ReliabilityGovernanceGuard;
//# sourceMappingURL=reliability-governance-guard.entity.d.ts.map