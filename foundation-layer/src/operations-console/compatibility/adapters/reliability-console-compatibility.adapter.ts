import { createOperationsConsoleCompatibilityResult } from "../entities/operations-console-compatibility-result.entity.js";
import type { OperationsConsoleCompatibilityResult } from "../entities/operations-console-compatibility-result.entity.js";
import type {
  AdaptOperationsConsoleCompatibilityInput,
  OperationsConsoleCompatibilityAdapter,
} from "../interfaces/operations-console-compatibility-adapter.js";
import { createOperationsConsoleCompatibilityResultId } from "../../value-objects/operations-console-ids.vo.js";

export class ReliabilityConsoleCompatibilityAdapter
  implements OperationsConsoleCompatibilityAdapter<AdaptOperationsConsoleCompatibilityInput>
{
  adapt(input: AdaptOperationsConsoleCompatibilityInput): OperationsConsoleCompatibilityResult {
    return createOperationsConsoleCompatibilityResult({
      id: createOperationsConsoleCompatibilityResultId("occ_reliabilitycompat001"),
      source_module: input.source_module,
      target_contract: "operations_console.audit_visibility",
      compatible: true,
      propagated_visibility: input.visibility,
      propagated_allowed_actions: [...input.allowed_actions].filter(
        (action) => !input.denied_actions.includes(action),
      ),
      propagated_denied_actions: [...input.denied_actions],
      lossy_fields: ["raw_observability_payload"],
      notes: ["reliability mapping is warning/blocking focused"],
    });
  }
}
