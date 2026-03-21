import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { VisibilityStatus } from "../../enums/visibility-status.enum.js";
import type { AuditTimelineViewId } from "../../value-objects/operations-console-ids.vo.js";
import type { AuditCorrelationGroup } from "./audit-correlation-group.entity.js";
import type { AuditFilterState } from "./audit-filter-state.entity.js";
import type { AuditTimelineItem } from "./audit-timeline-item.entity.js";

export type AuditTimelineView = Readonly<{
  id: AuditTimelineViewId;
  version: string;
  target_ref: string;
  timeline_items: readonly AuditTimelineItem[];
  correlation_groups: readonly AuditCorrelationGroup[];
  filter_state: AuditFilterState;
  visibility_status: VisibilityStatus;
}>;

export const createAuditTimelineView = (input: AuditTimelineView): AuditTimelineView => deepFreeze({ ...input });
