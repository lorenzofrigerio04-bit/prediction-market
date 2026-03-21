import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createObservationNormalizationResult = (input) => {
    const isComplete = input.traceabilityCompleteness.hasSourceReference &&
        input.traceabilityCompleteness.hasRawPayloadReference &&
        input.traceabilityCompleteness.hasEvidenceSpans &&
        input.traceabilityCompleteness.hasTraceabilityMetadata;
    if (isComplete !== input.traceabilityCompleteness.isComplete) {
        throw new ValidationError("INVALID_NORMALIZATION_RESULT", "traceabilityCompleteness.isComplete must match explicit completeness flags");
    }
    return deepFreeze({
        observation: input.observation,
        validationIssues: [...input.validationIssues],
        normalizationIssues: [...input.normalizationIssues],
        deterministicWarnings: [...input.deterministicWarnings],
        traceabilityCompleteness: input.traceabilityCompleteness,
    });
};
//# sourceMappingURL=observation-normalization-result.js.map