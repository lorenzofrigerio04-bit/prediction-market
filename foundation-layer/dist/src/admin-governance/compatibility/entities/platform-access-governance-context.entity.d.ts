import type { ModuleKey, OperationKey } from "../../value-objects/index.js";
export type PlatformAccessGovernanceContext = Readonly<{
    module_key: ModuleKey;
    requested_operations: readonly OperationKey[];
    denied_operations: readonly OperationKey[];
}>;
export declare const createPlatformAccessGovernanceContext: (input: PlatformAccessGovernanceContext) => PlatformAccessGovernanceContext;
//# sourceMappingURL=platform-access-governance-context.entity.d.ts.map