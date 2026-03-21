import { actionSurfaceSchema } from "./action-surface.schema.js";
import { artifactInspectionViewSchema } from "./artifact-inspection-view.schema.js";
import { auditTimelineItemSchema } from "./audit-timeline-item.schema.js";
import { auditTimelineViewSchema } from "./audit-timeline-view.schema.js";
import { candidateDetailViewSchema } from "./candidate-detail-view.schema.js";
import { candidateListViewSchema } from "./candidate-list-view.schema.js";
import { consoleNavigationStateSchema } from "./console-navigation-state.schema.js";
import { permissionAwareViewStateSchema } from "./permission-aware-view-state.schema.js";
import { queueEntryViewSchema } from "./queue-entry-view.schema.js";
import { queuePanelViewSchema } from "./queue-panel-view.schema.js";
import { readinessPanelViewSchema } from "./readiness-panel-view.schema.js";
import { sharedConsoleSchema } from "./shared-console.schema.js";

export const operationsConsoleSchemas = [
  sharedConsoleSchema,
  queueEntryViewSchema,
  queuePanelViewSchema,
  candidateListViewSchema,
  candidateDetailViewSchema,
  artifactInspectionViewSchema,
  auditTimelineItemSchema,
  auditTimelineViewSchema,
  readinessPanelViewSchema,
  actionSurfaceSchema,
  consoleNavigationStateSchema,
  permissionAwareViewStateSchema,
] as const;

export {
  actionSurfaceSchema,
  artifactInspectionViewSchema,
  auditTimelineItemSchema,
  auditTimelineViewSchema,
  candidateDetailViewSchema,
  candidateListViewSchema,
  consoleNavigationStateSchema,
  permissionAwareViewStateSchema,
  queueEntryViewSchema,
  queuePanelViewSchema,
  readinessPanelViewSchema,
  sharedConsoleSchema,
};

export * from "./action-surface.schema.js";
export * from "./artifact-inspection-view.schema.js";
export * from "./audit-timeline-item.schema.js";
export * from "./audit-timeline-view.schema.js";
export * from "./candidate-detail-view.schema.js";
export * from "./candidate-list-view.schema.js";
export * from "./console-navigation-state.schema.js";
export * from "./permission-aware-view-state.schema.js";
export * from "./queue-entry-view.schema.js";
export * from "./queue-panel-view.schema.js";
export * from "./readiness-panel-view.schema.js";
export * from "./shared-console.schema.js";
