/**
 * EventLead supplier for the discovery-backed pipeline path.
 *
 * When USE_DISCOVERY_BACKED_PIPELINE=true, runEventGenV2Pipeline calls this to obtain
 * EventLeads before running runDiscoveryBackedPipelineFromLeads.
 *
 * Contract (production-ready): Returned leads must be READY (EventLeadReadiness.READY)
 * and suitable for eventLeadToSourceObservationAdapter.convert(lead). The downstream
 * pipeline converts only READY + (MEDIUM|HIGH) confidence leads to SourceObservation.
 *
 * Implemented via runDiscoveryLeadSupplier (registry → connectors/adapters → normalize →
 * dedupe → cluster → trend → rank → event lead extraction). See discovery-lead-supplier.ts.
 */

import type { EventLead } from "@market-design-engine/foundation-layer";
import { runDiscoveryLeadSupplier } from "./discovery-lead-supplier";

/**
 * Returns EventLeads for the discovery-backed pipeline.
 *
 * Contract: Each returned lead is READY and suitable for
 * eventLeadToSourceObservationAdapter (foundation-layer).
 *
 * @returns Promise resolving to EventLead[] from the discovery engine pipeline.
 */
export async function getDiscoveryBackedEventLeads(): Promise<EventLead[]> {
  const result = await runDiscoveryLeadSupplier();

  console.log(
    "[discovery-lead-supplier]",
    JSON.stringify(result.report, null, 2)
  );

  return result.leads;
}
