import type { OperationKey } from "../../value-objects/index.js";
export type PublicationGovernanceGuard = Readonly<{
    denied_operations: readonly OperationKey[];
}>;
export declare const createPublicationGovernanceGuard: (input: PublicationGovernanceGuard) => PublicationGovernanceGuard;
//# sourceMappingURL=publication-governance-guard.entity.d.ts.map