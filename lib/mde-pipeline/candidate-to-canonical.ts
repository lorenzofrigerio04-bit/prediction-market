/**
 * Build CanonicalEventIntelligence from one or more EventCandidates.
 * Single-candidate path: one canonical event per candidate with supporting_observations from candidate.
 */

import { createEntityVersion, eventIntelligence } from "@market-design-engine/foundation-layer";

const {
  createCanonicalEventIntelligence,
  createCanonicalEventIntelligenceId,
  createEventClusterId,
} = eventIntelligence;

export type EventCandidate = ReturnType<
  typeof import("./interpretation-to-candidate").interpretationToEventCandidate
>;

/**
 * Build one CanonicalEvent from a single EventCandidate.
 * supporting_observations = candidate.observation_ids; supporting_candidates = [candidate.id].
 */
export function candidateToCanonicalEvent(
  candidate: EventCandidate
): ReturnType<typeof createCanonicalEventIntelligence> {
  const ceId = createCanonicalEventIntelligenceId(
    `cevt_${candidate.id.replace(/^ecnd_/, "").slice(0, 12)}`
  );
  const clusterId = createEventClusterId(`eclu_${ceId.slice(5).slice(0, 8)}`);

  return createCanonicalEventIntelligence({
    id: ceId,
    version: createEntityVersion(),
    subject: candidate.subject_candidate,
    action: candidate.action_candidate,
    object_nullable: candidate.object_candidate_nullable,
    event_type: "general",
    category: candidate.category_candidate,
    time_window: candidate.temporal_window_candidate,
    jurisdiction_nullable: candidate.jurisdiction_candidate_nullable,
    supporting_candidates: [candidate.id],
    supporting_observations: [...candidate.observation_ids],
    conflicting_observations: [],
    canonicalization_confidence: candidate.extraction_confidence,
    dedupe_cluster_id: clusterId,
    graph_node_id_nullable: null,
  });
}
