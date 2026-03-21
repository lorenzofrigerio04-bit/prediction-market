import type { OperationKey } from "../../value-objects/index.js";
export type EditorialGovernanceGuard = Readonly<{
    denied_operations: readonly OperationKey[];
}>;
export declare const createEditorialGovernanceGuard: (input: EditorialGovernanceGuard) => EditorialGovernanceGuard;
//# sourceMappingURL=editorial-governance-guard.entity.d.ts.map