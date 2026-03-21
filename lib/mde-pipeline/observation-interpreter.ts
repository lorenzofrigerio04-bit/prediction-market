/**
 * Concrete ObservationInterpreter: SourceObservation → ObservationInterpretation.
 * Rule-based implementation that extracts headline/summary as a single interpreted claim
 * so the foundation pipeline can consume it.
 */

import type { SourceObservation } from "@market-design-engine/foundation-layer";
import {
  createEntityVersion,
  eventIntelligence,
} from "@market-design-engine/foundation-layer";

const {
  createEvidenceSpan,
  createInterpretedClaim,
  createObservationInterpretation,
  createInterpretationMetadata,
  createObservationInterpretationId,
} = eventIntelligence;

const INTERPRETER_VERSION = "mde-deterministic-interpreter-v1";
const STRATEGY_ID = "headline-as-claim";

/**
 * Deterministic interpreter: maps observation headline/summary into one InterpretedClaim
 * so that ObservationInterpretation satisfies "at least one interpreted_* non-empty".
 */
export function interpretObservation(
  observation: SourceObservation
): ReturnType<typeof createObservationInterpretation> {
  const headline = observation.normalizedHeadlineNullable ?? "";
  const summary = observation.normalizedSummaryNullable ?? "";
  const text = [headline, summary].filter(Boolean).join(" ").trim() || "No content";
  const id = createObservationInterpretationId(
    `oint_${observation.id.replace(/^obs_/, "")}`
  );

  const evidenceSpan = createEvidenceSpan({
    span_id: `ev_${observation.id}`,
    source_observation_id: observation.id,
    locator: "/headline",
    start_offset: 0,
    end_offset: Math.min(text.length, 500),
    extracted_text_nullable: text.slice(0, 500),
    mapped_field_nullable: "normalizedHeadlineNullable",
  });

  const claim = createInterpretedClaim({
    text: text.slice(0, 500),
    polarity: "UNCERTAIN",
    confidence: 0.6,
    evidence_spans: [evidenceSpan],
  });

  const metadata = createInterpretationMetadata({
    interpreter_version: INTERPRETER_VERSION,
    strategy_ids: [STRATEGY_ID],
    deterministic: true,
  });

  return createObservationInterpretation({
    id,
    version: createEntityVersion(),
    source_observation_id: observation.id,
    interpreted_entities: [],
    interpreted_dates: [],
    interpreted_numbers: [],
    interpreted_claims: [claim],
    semantic_confidence: 0.6,
    interpretation_metadata: metadata,
  });
}
