import type { QueuePanelView } from "../entities/queue-panel-view.entity.js";
import { createQueuePanelView } from "../entities/queue-panel-view.entity.js";
import type { BuildQueueViewInput, QueueViewBuilder } from "../interfaces/queue-view-builder.js";
import { validateQueuePanelView } from "../../validators/validate-queue-panel-view.js";

export class DeterministicQueueViewBuilder implements QueueViewBuilder {
  buildQueueView(input: BuildQueueViewInput): QueuePanelView {
    const report = validateQueuePanelView(input.view);
    if (!report.isValid) {
      throw new Error(`Invalid QueuePanelView: ${report.issues.map((issue) => issue.code).join(",")}`);
    }
    return createQueuePanelView(input.view);
  }
}
