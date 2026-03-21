import { createAuditTimelineView } from "../entities/audit-timeline-view.entity.js";
import { validateAuditTimelineView } from "../../validators/validate-audit-timeline-view.js";
export class DeterministicAuditTimelineBuilder {
    buildTimeline(input) {
        const report = validateAuditTimelineView(input.view);
        if (!report.isValid) {
            throw new Error(`Invalid AuditTimelineView: ${report.issues.map((issue) => issue.code).join(",")}`);
        }
        return createAuditTimelineView(input.view);
    }
}
//# sourceMappingURL=deterministic-audit-timeline-builder.js.map