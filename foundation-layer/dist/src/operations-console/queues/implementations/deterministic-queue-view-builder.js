import { createQueuePanelView } from "../entities/queue-panel-view.entity.js";
import { validateQueuePanelView } from "../../validators/validate-queue-panel-view.js";
export class DeterministicQueueViewBuilder {
    buildQueueView(input) {
        const report = validateQueuePanelView(input.view);
        if (!report.isValid) {
            throw new Error(`Invalid QueuePanelView: ${report.issues.map((issue) => issue.code).join(",")}`);
        }
        return createQueuePanelView(input.view);
    }
}
//# sourceMappingURL=deterministic-queue-view-builder.js.map