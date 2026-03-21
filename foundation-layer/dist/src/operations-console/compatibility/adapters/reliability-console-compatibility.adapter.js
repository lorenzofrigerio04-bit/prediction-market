import { createOperationsConsoleCompatibilityResult } from "../entities/operations-console-compatibility-result.entity.js";
import { createOperationsConsoleCompatibilityResultId } from "../../value-objects/operations-console-ids.vo.js";
export class ReliabilityConsoleCompatibilityAdapter {
    adapt(input) {
        return createOperationsConsoleCompatibilityResult({
            id: createOperationsConsoleCompatibilityResultId("occ_reliabilitycompat001"),
            source_module: input.source_module,
            target_contract: "operations_console.audit_visibility",
            compatible: true,
            propagated_visibility: input.visibility,
            propagated_allowed_actions: [...input.allowed_actions].filter((action) => !input.denied_actions.includes(action)),
            propagated_denied_actions: [...input.denied_actions],
            lossy_fields: ["raw_observability_payload"],
            notes: ["reliability mapping is warning/blocking focused"],
        });
    }
}
//# sourceMappingURL=reliability-console-compatibility.adapter.js.map