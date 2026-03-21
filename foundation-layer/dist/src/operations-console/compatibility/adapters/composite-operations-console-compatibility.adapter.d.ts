import type { OperationsConsoleCompatibilityResult } from "../entities/operations-console-compatibility-result.entity.js";
import type { OperationsConsoleCompatibilityAdapter } from "../interfaces/operations-console-compatibility-adapter.js";
export type CompositeCompatibilityInput = Readonly<{
    source_module: string;
    results: readonly OperationsConsoleCompatibilityResult[];
}>;
export declare class CompositeOperationsConsoleCompatibilityAdapter implements OperationsConsoleCompatibilityAdapter<CompositeCompatibilityInput> {
    adapt(input: CompositeCompatibilityInput): OperationsConsoleCompatibilityResult;
}
//# sourceMappingURL=composite-operations-console-compatibility.adapter.d.ts.map