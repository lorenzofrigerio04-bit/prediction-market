import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { SourceObservation } from "../entities/source-observation.entity.js";
import type { NormalizationIssue } from "./normalization-issue.js";

export type TraceabilityCompleteness = Readonly<{
  hasSourceReference: boolean;
  hasRawPayloadReference: boolean;
  hasEvidenceSpans: boolean;
  hasTraceabilityMetadata: boolean;
  isComplete: boolean;
}>;

export type ObservationNormalizationResult = Readonly<{
  observation: SourceObservation;
  validationIssues: readonly NormalizationIssue[];
  normalizationIssues: readonly NormalizationIssue[];
  deterministicWarnings: readonly string[];
  traceabilityCompleteness: TraceabilityCompleteness;
}>;

export const createObservationNormalizationResult = (
  input: ObservationNormalizationResult,
): ObservationNormalizationResult => {
  const isComplete =
    input.traceabilityCompleteness.hasSourceReference &&
    input.traceabilityCompleteness.hasRawPayloadReference &&
    input.traceabilityCompleteness.hasEvidenceSpans &&
    input.traceabilityCompleteness.hasTraceabilityMetadata;

  if (isComplete !== input.traceabilityCompleteness.isComplete) {
    throw new ValidationError(
      "INVALID_NORMALIZATION_RESULT",
      "traceabilityCompleteness.isComplete must match explicit completeness flags",
    );
  }

  return deepFreeze({
    observation: input.observation,
    validationIssues: [...input.validationIssues],
    normalizationIssues: [...input.normalizationIssues],
    deterministicWarnings: [...input.deterministicWarnings],
    traceabilityCompleteness: input.traceabilityCompleteness,
  });
};
