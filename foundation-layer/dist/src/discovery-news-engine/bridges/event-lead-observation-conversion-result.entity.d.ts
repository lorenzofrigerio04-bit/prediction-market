/**
 * Result of converting an EventLead to a SourceObservation.
 * Explains outcome (converted / skipped / rejected) and preserves lead/cluster for explainability.
 */
import type { EventLeadId } from "../value-objects/event-lead-id.vo.js";
import type { DiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import type { SourceObservation } from "../../observations/entities/source-observation.entity.js";
export type EventLeadObservationConversionOutcome = "converted" | "skipped" | "rejected";
export type EventLeadObservationConversionResult = Readonly<{
    outcome: EventLeadObservationConversionOutcome;
    leadId: EventLeadId;
    observation?: SourceObservation;
    reasonCode?: string;
    clusterId?: DiscoveryStoryClusterId;
}>;
export declare const createEventLeadObservationConversionResult: (input: EventLeadObservationConversionResult) => EventLeadObservationConversionResult;
//# sourceMappingURL=event-lead-observation-conversion-result.entity.d.ts.map