import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { FinalReadinessStatus } from "../../enums/final-readiness-status.enum.js";
import { createGatingSummary } from "../../value-objects/gating-summary.vo.js";
export const createPublicationReadyArtifact = (input) => {
    if (!Object.values(FinalReadinessStatus).includes(input.final_readiness_status)) {
        throw new ValidationError("INVALID_PUBLICATION_READY_ARTIFACT", "final_readiness_status is invalid");
    }
    if (input.final_readiness_status === FinalReadinessStatus.APPROVED &&
        input.approved_artifacts.length === 0) {
        throw new ValidationError("INVALID_PUBLICATION_READY_ARTIFACT", "approved artifacts are required for approved readiness status");
    }
    return deepFreeze({
        ...input,
        approved_artifacts: deepFreeze([...input.approved_artifacts]),
        gating_summary: createGatingSummary(input.gating_summary),
    });
};
//# sourceMappingURL=publication-ready-artifact.entity.js.map