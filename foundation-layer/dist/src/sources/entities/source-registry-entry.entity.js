import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createSourceRegistryEntry = (input) => {
    const ownerNotesNullable = input.ownerNotesNullable === null ? null : input.ownerNotesNullable.trim();
    if (ownerNotesNullable !== null && ownerNotesNullable.length === 0) {
        throw new ValidationError("INVALID_SOURCE_REGISTRY_ENTRY", "ownerNotesNullable cannot be empty when provided");
    }
    return deepFreeze({
        sourceDefinitionId: input.sourceDefinitionId,
        pollingPolicyNullable: input.pollingPolicyNullable,
        rateLimitProfileNullable: input.rateLimitProfileNullable,
        authenticationMode: input.authenticationMode,
        healthStatus: input.healthStatus,
        ownerNotesNullable,
        auditMetadata: input.auditMetadata,
    });
};
//# sourceMappingURL=source-registry-entry.entity.js.map