import type { AuditTimelineView } from "../entities/audit-timeline-view.entity.js";
import { createAuditTimelineView } from "../entities/audit-timeline-view.entity.js";
import type { AuditTimelineBuilder, BuildAuditTimelineInput } from "../interfaces/audit-timeline-builder.js";
import { validateAuditTimelineView } from "../../validators/validate-audit-timeline-view.js";

export class DeterministicAuditTimelineBuilder implements AuditTimelineBuilder {
  buildTimeline(input: BuildAuditTimelineInput): AuditTimelineView {
    const report = validateAuditTimelineView(input.view);
    if (!report.isValid) {
      throw new Error(`Invalid AuditTimelineView: ${report.issues.map((issue) => issue.code).join(",")}`);
    }
    return createAuditTimelineView(input.view);
  }
}
