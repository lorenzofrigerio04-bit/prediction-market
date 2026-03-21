import { createOperationsConsoleCompatibilityResult } from "../entities/operations-console-compatibility-result.entity.js";
import type { OperationsConsoleCompatibilityResult } from "../entities/operations-console-compatibility-result.entity.js";
import type {
  AdaptOperationsConsoleCompatibilityInput,
  OperationsConsoleCompatibilityAdapter,
} from "../interfaces/operations-console-compatibility-adapter.js";
import { createOperationsConsoleCompatibilityResultId } from "../../value-objects/operations-console-ids.vo.js";

export class EditorialConsoleCompatibilityAdapter
  implements OperationsConsoleCompatibilityAdapter<AdaptOperationsConsoleCompatibilityInput>
{
  adapt(input: AdaptOperationsConsoleCompatibilityInput): OperationsConsoleCompatibilityResult {
    return createOperationsConsoleCompatibilityResult({
      id: createOperationsConsoleCompatibilityResultId("occ_editorialcompat001"),
      source_module: input.source_module,
      target_contract: "operations_console.editorial_view",
      compatible: true,
      propagated_visibility: input.visibility,
      propagated_allowed_actions: [...input.allowed_actions].filter(
        (action) => !input.denied_actions.includes(action),
      ),
      propagated_denied_actions: [...input.denied_actions],
      lossy_fields: ["full_editorial_freeform_notes"],
      notes: ["editorial mapping is conservative and loss-aware"],
    });
  }
}
