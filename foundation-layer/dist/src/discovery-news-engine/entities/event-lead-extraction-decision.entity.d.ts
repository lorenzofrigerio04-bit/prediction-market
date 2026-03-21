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
export type EventLeadExtractionDecision = EventLeadExtractionDecisionLead | EventLeadExtractionDecisionNotExtracted;
export declare const createEventLeadExtractionDecisionLead: (input: EventLeadExtractionDecisionLead) => EventLeadExtractionDecisionLead;
export declare const createEventLeadExtractionDecisionNotExtracted: (input: EventLeadExtractionDecisionNotExtracted) => EventLeadExtractionDecisionNotExtracted;
//# sourceMappingURL=event-lead-extraction-decision.entity.d.ts.map