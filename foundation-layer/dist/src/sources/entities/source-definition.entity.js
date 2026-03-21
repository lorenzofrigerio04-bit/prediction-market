import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { deriveSourceCapabilityFromUseCases } from "../value-objects/source-capability.vo.js";
export const createSourceDefinition = (input) => {
    const displayName = input.displayName.trim();
    if (displayName.length === 0) {
        throw new ValidationError("INVALID_SOURCE_DEFINITION", "displayName must be non-empty");
    }
    if (input.supportedUseCases.length === 0) {
        throw new ValidationError("INVALID_SOURCE_DEFINITION", "supportedUseCases must contain at least one use case");
    }
    const normalizedUseCases = [...new Set(input.supportedUseCases)];
    if (normalizedUseCases.length !== input.supportedUseCases.length) {
        throw new ValidationError("INVALID_SOURCE_DEFINITION", "supportedUseCases must be unique");
    }
    return deepFreeze({
        ...input,
        displayName,
        capability: deriveSourceCapabilityFromUseCases(normalizedUseCases),
    });
};
//# sourceMappingURL=source-definition.entity.js.map