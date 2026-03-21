import { createReadinessPanelView } from "../entities/readiness-panel-view.entity.js";
import { validateReadinessPanelView } from "../../validators/validate-readiness-panel-view.js";
export class DeterministicReadinessPanelBuilder {
    buildReadinessPanel(input) {
        const report = validateReadinessPanelView(input.view);
        if (!report.isValid) {
            throw new Error(`Invalid ReadinessPanelView: ${report.issues.map((issue) => issue.code).join(",")}`);
        }
        return createReadinessPanelView(input.view);
    }
}
//# sourceMappingURL=deterministic-readiness-panel-builder.js.map