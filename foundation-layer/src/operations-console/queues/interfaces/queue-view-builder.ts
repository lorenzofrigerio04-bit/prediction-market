import type { QueuePanelView } from "../entities/queue-panel-view.entity.js";

export type BuildQueueViewInput = Readonly<{
  view: QueuePanelView;
}>;

export interface QueueViewBuilder {
  buildQueueView(input: BuildQueueViewInput): QueuePanelView;
}
