/**
 * Bridge: EventLead → SourceObservation.
 * Converts discovery event leads into foundation-layer observations for the MDE pipeline.
 * Does not trigger ObservationInterpretation, EventCandidate, or publisher logic.
 */

import type { EventLead } from "../entities/event-lead.entity.js";
import { EventLeadReadiness } from "../enums/event-lead-readiness.enum.js";
import { EventLeadConfidence } from "../enums/event-lead-confidence.enum.js";
import {
  createEventLeadObservationConversionResult,
  type EventLeadObservationConversionResult,
} from "./event-lead-observation-conversion-result.entity.js";
import { createSourceObservation } from "../../observations/entities/source-observation.entity.js";
import { createSourceObservationId } from "../../observations/value-objects/source-observation-id.vo.js";
import { createEntityVersion } from "../../value-objects/entity-version.vo.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";
import { createSourceReference } from "../../observations/value-objects/source-reference.vo.js";
import { SourceReferenceKind } from "../../observations/enums/source-reference-kind.enum.js";
import { createRawPayloadReference } from "../../observations/value-objects/raw-payload-reference.vo.js";
import { createEvidenceSpan } from "../../observations/value-objects/evidence-span.vo.js";
import { EvidenceSpanKind } from "../../observations/enums/evidence-span-kind.enum.js";
import { createObservationConfidenceScore } from "../../observations/value-objects/confidence-score.vo.js";
import { createTraceabilityMetadata } from "../../observations/value-objects/traceability-metadata.vo.js";
import { createSourceDefinitionId } from "../../sources/value-objects/source-definition-id.vo.js";
import { createJurisdictionCandidate } from "../../observations/value-objects/jurisdiction-candidate.vo.js";
import { createLanguageCode } from "../../observations/value-objects/language-code.vo.js";
import { NormalizationStatus } from "../../observations/enums/normalization-status.enum.js";

const NORMALIZER_VERSION = "event-lead-to-source-observation-v1";
const MAPPING_STRATEGY = "event-lead-to-source-observation";
const MAX_HEADLINE_LEN = 300;
const MAX_SUMMARY_LEN = 2000;

function observationIdFromLeadId(leadId: string): string {
  const body = leadId.replace(/^del_/, "");
  return `obs_lead_${body}`;
}

function confidenceToScore(confidence: EventLeadConfidence): number {
  switch (confidence) {
    case EventLeadConfidence.HIGH:
      return 0.9;
    case EventLeadConfidence.MEDIUM:
      return 0.6;
    case EventLeadConfidence.LOW:
      return 0.3;
    default:
      return 0.5;
  }
}

export interface EventLeadToSourceObservationAdapter {
  convert(lead: EventLead): EventLeadObservationConversionResult;
}

export const eventLeadToSourceObservationAdapter: EventLeadToSourceObservationAdapter = {
  convert(lead: EventLead): EventLeadObservationConversionResult {
    const leadIdStr = String(lead.id);

    if (!leadIdStr || leadIdStr.trim().length === 0) {
      return createEventLeadObservationConversionResult({
        outcome: "rejected",
        leadId: lead.id,
        reasonCode: "invalid_lead_id",
        clusterId: lead.sourceClusterId,
      });
    }

    const hypothesisTrimmed = lead.hypothesisSummary?.trim() ?? "";
    if (hypothesisTrimmed.length === 0) {
      return createEventLeadObservationConversionResult({
        outcome: "rejected",
        leadId: lead.id,
        reasonCode: "missing_hypothesis",
        clusterId: lead.sourceClusterId,
      });
    }

    const hasItemEvidence = lead.evidenceSet.memberItemIds.length > 0;
    const hasSignalEvidence =
      lead.evidenceSet.memberSignalIds != null &&
      lead.evidenceSet.memberSignalIds.length > 0;
    if (!hasItemEvidence && !hasSignalEvidence) {
      return createEventLeadObservationConversionResult({
        outcome: "rejected",
        leadId: lead.id,
        reasonCode: "incomplete_evidence",
        clusterId: lead.sourceClusterId,
      });
    }

    if (lead.readiness !== EventLeadReadiness.READY) {
      return createEventLeadObservationConversionResult({
        outcome: "skipped",
        leadId: lead.id,
        reasonCode: "not_ready",
        clusterId: lead.sourceClusterId,
      });
    }

    // LOW confidence leads are now converted too (score 0.3); no skip.
    const now = new Date();
    const observedAt = createTimestamp(now);
    const ingestedAt = createTimestamp(now);

    const headline =
      lead.evidenceSet.representativeHeadlineNullable?.trim() ||
      hypothesisTrimmed.slice(0, MAX_HEADLINE_LEN) ||
      hypothesisTrimmed;
    const summary = hypothesisTrimmed.length > MAX_SUMMARY_LEN
      ? hypothesisTrimmed.slice(0, MAX_SUMMARY_LEN)
      : hypothesisTrimmed;

    const observationId = createSourceObservationId(observationIdFromLeadId(leadIdStr));
    const clusterIdStr = String(lead.sourceClusterId);

    const evidenceSpans = [
      createEvidenceSpan({
        spanId: `span-${observationId}-hypothesis`,
        kind: EvidenceSpanKind.RAW_TEXT,
        locator: "discovery://hypothesis",
        startOffset: 0,
        endOffset: summary.length,
        extractedText: summary,
        mappedField: "normalizedSummaryNullable",
      }),
    ];

    for (let i = 0; i < lead.evidenceSet.memberItemIds.length; i++) {
      const itemId = lead.evidenceSet.memberItemIds[i]!;
      evidenceSpans.push(
        createEvidenceSpan({
          spanId: `span-${observationId}-item-${i}`,
          kind: EvidenceSpanKind.METADATA,
          locator: `discovery://item/${itemId}`,
          startOffset: null,
          endOffset: null,
          extractedText: null,
          mappedField: null,
        }),
      );
    }
    const signalIds = lead.evidenceSet.memberSignalIds ?? [];
    for (let i = 0; i < signalIds.length; i++) {
      const signalId = signalIds[i]!;
      const signalIdStr = typeof signalId === "string" ? signalId : String(signalId);
      evidenceSpans.push(
        createEvidenceSpan({
          spanId: `span-${observationId}-signal-${i}`,
          kind: EvidenceSpanKind.METADATA,
          locator: `discovery://signal/${signalIdStr}`,
          startOffset: null,
          endOffset: null,
          extractedText: null,
          mappedField: null,
        }),
      );
    }

    const observation = createSourceObservation({
      id: observationId,
      version: createEntityVersion(),
      sourceDefinitionId: createSourceDefinitionId("sdef_discovery_event_lead"),
      observedAt,
      ingestedAt,
      sourceReference: createSourceReference({
        kind: SourceReferenceKind.OTHER,
        reference: `discovery://event-lead/${leadIdStr}`,
        locator: null,
      }),
      rawPayloadReference: createRawPayloadReference({
        uri: `discovery://event-lead/${leadIdStr}`,
        checksum: null,
      }),
      normalizedHeadlineNullable: headline || null,
      normalizedSummaryNullable: summary || null,
      extractedEntities: [],
      extractedDates: [],
      extractedNumbers: [],
      extractedClaims: [],
      language: createLanguageCode("it"),
      jurisdictionCandidates: [createJurisdictionCandidate("XX", 0.5)],
      evidenceSpans,
      sourceConfidence: createObservationConfidenceScore(confidenceToScore(lead.confidence)),
      normalizationStatus: NormalizationStatus.NORMALIZED,
      traceabilityMetadata: createTraceabilityMetadata({
        normalizerVersion: NORMALIZER_VERSION,
        mappingStrategyIds: [MAPPING_STRATEGY],
        isTraceabilityComplete: true,
        provenanceChain: [
          "discovery",
          "event-lead-extraction",
          MAPPING_STRATEGY,
          leadIdStr,
          clusterIdStr,
        ],
      }),
    });

    return createEventLeadObservationConversionResult({
      outcome: "converted",
      leadId: lead.id,
      observation,
      clusterId: lead.sourceClusterId,
    });
  },
};
