import { createOperationsConsoleCompatibilityResult } from "../entities/operations-console-compatibility-result.entity.js";
import { createOperationsConsoleCompatibilityResultId } from "../../value-objects/operations-console-ids.vo.js";
export class PublicationConsoleCompatibilityAdapter {
    adapt(input) {
        return createOperationsConsoleCompatibilityResult({
            id: createOperationsConsoleCompatibilityResultId("occ_publicationcompat001"),
            source_module: input.source_module,
            target_contract: "operations_console.publication_readiness",
            compatible: true,
            propagated_visibility: input.visibility,
            propagated_allowed_actions: [...input.allowed_actions].filter((action) => !input.denied_actions.includes(action)),
            propagated_denied_actions: [...input.denied_actions],
            lossy_fields: ["external_distribution_transport_metadata"],
            notes: ["publication handoff mapping keeps deny-first constraints"],
        });
    }
}
//# sourceMappingURL=publication-console-compatibility.adapter.js.map