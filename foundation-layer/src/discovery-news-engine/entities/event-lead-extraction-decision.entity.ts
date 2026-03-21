import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { DiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import type { EventLead } from "./event-lead.entity.js";
import type { EventLeadReason } from "./event-lead-reason.entity.js";

export type EventLeadExtractionDecisionLead = Readonly<{
  outcome: "lead";
  lead: EventLead;
}>;

export type EventLeadExtractionDecisionNotExtracted = Readonly<{
  outcome: "not_extracted";
  clusterId: DiscoveryStoryClusterId;
  reasons: readonly EventLeadReason[];
  missingConditions: readonly string[];
}>;

export type EventLeadExtractionDecision =
  | EventLeadExtractionDecisionLead
  | EventLeadExtractionDecisionNotExtracted;

export const createEventLeadExtractionDecisionLead = (
  input: EventLeadExtractionDecisionLead,
): EventLeadExtractionDecisionLead => deepFreeze({ ...input });

export const createEventLeadExtractionDecisionNotExtracted = (
  input: EventLeadExtractionDecisionNotExtracted,
): EventLeadExtractionDecisionNotExtracted =>
  deepFreeze({
    ...input,
    reasons: [...input.reasons],
    missingConditions: [...input.missingConditions],
  });
