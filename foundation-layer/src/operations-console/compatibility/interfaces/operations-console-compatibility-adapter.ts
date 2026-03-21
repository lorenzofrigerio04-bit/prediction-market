import type { OperationsConsoleCompatibilityResult } from "../entities/operations-console-compatibility-result.entity.js";

export type AdaptOperationsConsoleCompatibilityInput = Readonly<{
  source_module: string;
  visibility: "visible" | "partial" | "hidden";
  allowed_actions: readonly string[];
  denied_actions: readonly string[];
}>;

export interface OperationsConsoleCompatibilityAdapter<TInput = AdaptOperationsConsoleCompatibilityInput> {
  adapt(input: TInput): OperationsConsoleCompatibilityResult;
}
