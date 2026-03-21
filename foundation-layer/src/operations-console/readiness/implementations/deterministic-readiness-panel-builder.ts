import type { ReadinessPanelView } from "../entities/readiness-panel-view.entity.js";
import { createReadinessPanelView } from "../entities/readiness-panel-view.entity.js";
import type { BuildReadinessPanelInput, ReadinessPanelBuilder } from "../interfaces/readiness-panel-builder.js";
import { validateReadinessPanelView } from "../../validators/validate-readiness-panel-view.js";

export class DeterministicReadinessPanelBuilder implements ReadinessPanelBuilder {
  buildReadinessPanel(input: BuildReadinessPanelInput): ReadinessPanelView {
    const report = validateReadinessPanelView(input.view);
    if (!report.isValid) {
      throw new Error(`Invalid ReadinessPanelView: ${report.issues.map((issue) => issue.code).join(",")}`);
    }
    return createReadinessPanelView(input.view);
  }
}
