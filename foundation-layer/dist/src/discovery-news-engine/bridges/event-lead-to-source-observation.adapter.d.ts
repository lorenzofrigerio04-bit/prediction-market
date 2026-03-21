/**
 * Bridge: EventLead → SourceObservation.
 * Converts discovery event leads into foundation-layer observations for the MDE pipeline.
 * Does not trigger ObservationInterpretation, EventCandidate, or publisher logic.
 */
import type { EventLead } from "../entities/event-lead.entity.js";
import { type EventLeadObservationConversionResult } from "./event-lead-observation-conversion-result.entity.js";
export interface EventLeadToSourceObservationAdapter {
    convert(lead: EventLead): EventLeadObservationConversionResult;
}
export declare const eventLeadToSourceObservationAdapter: EventLeadToSourceObservationAdapter;
//# sourceMappingURL=event-lead-to-source-observation.adapter.d.ts.map