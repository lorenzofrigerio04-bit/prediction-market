import type { AuditTimelineView } from "../entities/audit-timeline-view.entity.js";
export type BuildAuditTimelineInput = Readonly<{
    view: AuditTimelineView;
}>;
export interface AuditTimelineBuilder {
    buildTimeline(input: BuildAuditTimelineInput): AuditTimelineView;
}
//# sourceMappingURL=audit-timeline-builder.d.ts.map