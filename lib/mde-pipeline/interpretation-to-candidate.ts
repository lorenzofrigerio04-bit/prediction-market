/**
 * Build EventCandidate from ObservationInterpretation (single-observer path).
 * Uses foundation eventIntelligence types.
 */

import {
  createEntityVersion,
  createTimestamp,
  eventIntelligence,
} from "@market-design-engine/foundation-layer";

const {
  createEventCandidate,
  createEventCandidateId,
  createSubjectReference,
  createActionReference,
  createTemporalWindow,
  createEvidenceSpan,
  CandidateStatus,
} = eventIntelligence;

function toTimestamp(s: string): ReturnType<typeof createTimestamp> {
  return createTimestamp(s);
}

export type ObservationInterpretation = ReturnType<
  typeof import("./observation-interpreter").interpretObservation
>;

const DEFAULT_START = "2026-01-01T00:00:00.000Z";
const DEFAULT_END = "2026-12-31T23:59:59.999Z";

/**
 * Build a single EventCandidate from one ObservationInterpretation.
 * Uses first interpreted claim as action; placeholder subject and default time window.
 */
export function interpretationToEventCandidate(
  interpretation: ObservationInterpretation
): ReturnType<typeof createEventCandidate> {
  const observationId = interpretation.source_observation_id;
  const claim =
    interpretation.interpreted_claims[0];
  const actionText =
    claim?.text?.slice(0, 200)?.trim() || "Reported event";
  const evidenceSpans =
    claim?.evidence_spans?.length
      ? claim.evidence_spans
      : [
          createEvidenceSpan({
            span_id: `ev_${interpretation.id}`,
            source_observation_id: observationId,
            locator: "/claim",
            start_offset: 0,
            end_offset: actionText.length,
            extracted_text_nullable: actionText,
            mapped_field_nullable: "interpreted_claims[0].text",
          }),
        ];

  return createEventCandidate({
    id: createEventCandidateId(`ecnd_${interpretation.id.replace(/^oint_/, "").slice(0, 12)}`),
    version: createEntityVersion(),
    observation_ids: [observationId],
    subject_candidate: createSubjectReference({
      value: "Reported event",
      normalized_value: "reported event",
      entity_type: "event",
    }),
    action_candidate: createActionReference({
      value: actionText,
      normalized_value: actionText.toLowerCase().slice(0, 100),
    }),
    object_candidate_nullable: null,
    temporal_window_candidate: createTemporalWindow({
      start_at: toTimestamp(DEFAULT_START),
      end_at: toTimestamp(DEFAULT_END),
    }),
    jurisdiction_candidate_nullable: null,
    category_candidate: "general",
    extraction_confidence: interpretation.semantic_confidence,
    evidence_spans: evidenceSpans,
    candidate_status: CandidateStatus.PROPOSED,
  });
}
