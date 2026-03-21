import type { EventLeadId } from "../value-objects/event-lead-id.vo.js";
import type { DiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import type { EventLeadStatus } from "../enums/event-lead-status.enum.js";
import type { EventLeadReadiness } from "../enums/event-lead-readiness.enum.js";
import type { EventLeadConfidence } from "../enums/event-lead-confidence.enum.js";
import type { EventLeadReason } from "./event-lead-reason.entity.js";
import type { EventLeadEvidenceSet } from "./event-lead-evidence-set.entity.js";
export type EventLead = Readonly<{
    id: EventLeadId;
    sourceClusterId: DiscoveryStoryClusterId;
    status: EventLeadStatus;
    readiness: EventLeadReadiness;
    confidence: EventLeadConfidence;
    hypothesisSummary: string;
    evidenceSet: EventLeadEvidenceSet;
    reasons: readonly EventLeadReason[];
    cautionFlags?: readonly string[];
    missingConditionsNullable?: readonly string[] | null;
    italianRelevanceContextNullable?: string | null;
    sourceSupportContextNullable?: string | null;
}>;
export declare const createEventLead: (input: EventLead) => EventLead;
//# sourceMappingURL=event-lead.entity.d.ts.map