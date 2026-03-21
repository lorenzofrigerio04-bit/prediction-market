import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { SeverityLevel } from "../../enums/severity-level.enum.js";
import { TimelineActionType } from "../../enums/timeline-action-type.enum.js";
import type { ActorRef } from "../../value-objects/actor-ref.vo.js";

export type AuditTimelineItem = Readonly<{
  item_ref: string;
  timestamp: string;
  actor_ref: ActorRef;
  action_type: TimelineActionType;
  summary: string;
  severity: SeverityLevel;
  linked_entity_refs: readonly string[];
}>;

export const createAuditTimelineItem = (input: AuditTimelineItem): AuditTimelineItem => deepFreeze({ ...input });
