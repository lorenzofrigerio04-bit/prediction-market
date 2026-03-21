import { createOperationsConsoleCompatibilityResult } from "../entities/operations-console-compatibility-result.entity.js";
import { createOperationsConsoleCompatibilityResultId } from "../../value-objects/operations-console-ids.vo.js";
export class PlatformAccessConsoleCompatibilityAdapter {
    adapt(input) {
        return createOperationsConsoleCompatibilityResult({
            id: createOperationsConsoleCompatibilityResultId("occ_platformaccess001"),
            source_module: input.source_module,
            target_contract: "operations_console.permission_surface",
            compatible: true,
            propagated_visibility: input.visibility,
            propagated_allowed_actions: [...input.allowed_actions].filter((action) => !input.denied_actions.includes(action)),
            propagated_denied_actions: [...input.denied_actions],
            lossy_fields: [],
            notes: ["deny-first propagation preserved"],
        });
    }
}
//# sourceMappingURL=platform-access-console-compatibility.adapter.js.map