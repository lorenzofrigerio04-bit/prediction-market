import { createOperationsConsoleCompatibilityResult } from "../entities/operations-console-compatibility-result.entity.js";
import type { OperationsConsoleCompatibilityResult } from "../entities/operations-console-compatibility-result.entity.js";
import type { OperationsConsoleCompatibilityAdapter } from "../interfaces/operations-console-compatibility-adapter.js";
import { createOperationsConsoleCompatibilityResultId } from "../../value-objects/operations-console-ids.vo.js";

export type CompositeCompatibilityInput = Readonly<{
  source_module: string;
  results: readonly OperationsConsoleCompatibilityResult[];
}>;

const minVisibility = (values: readonly ("visible" | "partial" | "hidden")[]): "visible" | "partial" | "hidden" => {
  if (values.includes("hidden")) {
    return "hidden";
  }
  if (values.includes("partial")) {
    return "partial";
  }
  return "visible";
};

export class CompositeOperationsConsoleCompatibilityAdapter
  implements OperationsConsoleCompatibilityAdapter<CompositeCompatibilityInput>
{
  adapt(input: CompositeCompatibilityInput): OperationsConsoleCompatibilityResult {
    const allAllowed = input.results.flatMap((result) => result.propagated_allowed_actions);
    const allDenied = input.results.flatMap((result) => result.propagated_denied_actions);
    const deniedSet = new Set(allDenied);
    const conservativeAllowed = [...new Set(allAllowed)].filter((action) => !deniedSet.has(action));
    return createOperationsConsoleCompatibilityResult({
      id: createOperationsConsoleCompatibilityResultId("occ_compositecompat001"),
      source_module: input.source_module,
      target_contract: "operations_console.composite_surface",
      compatible: input.results.every((result) => result.compatible),
      propagated_visibility: minVisibility(input.results.map((result) => result.propagated_visibility)),
      propagated_allowed_actions: conservativeAllowed,
      propagated_denied_actions: [...new Set(allDenied)],
      lossy_fields: input.results.flatMap((result) => result.lossy_fields),
      notes: ["composite adapter keeps most restrictive visibility and deny-first action set"],
    });
  }
}
