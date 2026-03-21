import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import { NormalizationStatus } from "../enums/normalization-status.enum.js";
import type { ObservationConfidenceScore } from "../value-objects/confidence-score.vo.js";
import type { EvidenceSpan } from "../value-objects/evidence-span.vo.js";
import type { JurisdictionCandidate } from "../value-objects/jurisdiction-candidate.vo.js";
import type { LanguageCode } from "../value-objects/language-code.vo.js";
import type { RawPayloadReference } from "../value-objects/raw-payload-reference.vo.js";
import type { SourceObservationId } from "../value-objects/source-observation-id.vo.js";
import type { SourceReference } from "../value-objects/source-reference.vo.js";
import type { TraceabilityMetadata } from "../value-objects/traceability-metadata.vo.js";
import type { SourceDefinitionId } from "../../sources/value-objects/source-definition-id.vo.js";

export type SourceObservation = Readonly<{
  id: SourceObservationId;
  version: EntityVersion;
  sourceDefinitionId: SourceDefinitionId;
  observedAt: Timestamp;
  ingestedAt: Timestamp;
  sourceReference: SourceReference;
  rawPayloadReference: RawPayloadReference;
  normalizedHeadlineNullable: string | null;
  normalizedSummaryNullable: string | null;
  extractedEntities: readonly string[];
  extractedDates: readonly string[];
  extractedNumbers: readonly number[];
  extractedClaims: readonly string[];
  language: LanguageCode;
  jurisdictionCandidates: readonly JurisdictionCandidate[];
  evidenceSpans: readonly EvidenceSpan[];
  sourceConfidence: ObservationConfidenceScore;
  normalizationStatus: NormalizationStatus;
  traceabilityMetadata: TraceabilityMetadata;
}>;

export const createSourceObservation = (input: SourceObservation): SourceObservation => {
  if (Date.parse(input.ingestedAt) < Date.parse(input.observedAt)) {
    throw new ValidationError(
      "INVALID_SOURCE_OBSERVATION",
      "ingestedAt must be greater than or equal to observedAt",
      { observedAt: input.observedAt, ingestedAt: input.ingestedAt },
    );
  }
  if (input.evidenceSpans.length === 0) {
    throw new ValidationError(
      "INVALID_SOURCE_OBSERVATION",
      "evidenceSpans must contain at least one evidence span",
    );
  }

  const normalizedHeadlineNullable =
    input.normalizedHeadlineNullable === null ? null : input.normalizedHeadlineNullable.trim();
  const normalizedSummaryNullable =
    input.normalizedSummaryNullable === null ? null : input.normalizedSummaryNullable.trim();
  if (normalizedHeadlineNullable !== null && normalizedHeadlineNullable.length === 0) {
    throw new ValidationError(
      "INVALID_SOURCE_OBSERVATION",
      "normalizedHeadlineNullable cannot be empty when provided",
    );
  }
  if (normalizedSummaryNullable !== null && normalizedSummaryNullable.length === 0) {
    throw new ValidationError(
      "INVALID_SOURCE_OBSERVATION",
      "normalizedSummaryNullable cannot be empty when provided",
    );
  }

  return deepFreeze({
    ...input,
    normalizedHeadlineNullable,
    normalizedSummaryNullable,
    extractedEntities: [...input.extractedEntities],
    extractedDates: [...input.extractedDates],
    extractedNumbers: [...input.extractedNumbers],
    extractedClaims: [...input.extractedClaims],
    jurisdictionCandidates: [...input.jurisdictionCandidates],
    evidenceSpans: [...input.evidenceSpans],
  });
};
