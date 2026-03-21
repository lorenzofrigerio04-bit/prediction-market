import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createTraceabilityMetadata = (input) => {
    const normalizerVersion = input.normalizerVersion.trim();
    if (normalizerVersion.length === 0) {
        throw new ValidationError("INVALID_TRACEABILITY_METADATA", "normalizerVersion must be non-empty");
    }
    if (input.mappingStrategyIds.length === 0) {
        throw new ValidationError("INVALID_TRACEABILITY_METADATA", "mappingStrategyIds must be non-empty");
    }
    const mappingStrategyIds = input.mappingStrategyIds.map((id) => id.trim());
    if (mappingStrategyIds.some((id) => id.length === 0)) {
        throw new ValidationError("INVALID_TRACEABILITY_METADATA", "mappingStrategyIds must not contain empty values");
    }
    const provenanceChain = input.provenanceChain.map((item) => item.trim());
    if (provenanceChain.some((item) => item.length === 0)) {
        throw new ValidationError("INVALID_TRACEABILITY_METADATA", "provenanceChain must not contain empty values");
    }
    return deepFreeze({
        normalizerVersion,
        mappingStrategyIds,
        isTraceabilityComplete: input.isTraceabilityComplete,
        provenanceChain,
    });
};
//# sourceMappingURL=traceability-metadata.vo.js.map