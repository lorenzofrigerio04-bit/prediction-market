import type { ModuleKey, OperationKey } from "../../value-objects/index.js";
export type OperationsConsoleGovernanceView = Readonly<{
    module_key: ModuleKey;
    visible_operations: readonly OperationKey[];
}>;
export declare const createOperationsConsoleGovernanceView: (input: OperationsConsoleGovernanceView) => OperationsConsoleGovernanceView;
//# sourceMappingURL=operations-console-governance-view.entity.d.ts.map