import type { ReadinessPanelView } from "../entities/readiness-panel-view.entity.js";

export type BuildReadinessPanelInput = Readonly<{
  view: ReadinessPanelView;
}>;

export interface ReadinessPanelBuilder {
  buildReadinessPanel(input: BuildReadinessPanelInput): ReadinessPanelView;
}
