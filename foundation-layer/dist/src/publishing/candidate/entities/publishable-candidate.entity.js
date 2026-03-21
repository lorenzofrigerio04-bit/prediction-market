import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { PublishableCandidateStatus } from "../../enums/publishable-candidate-status.enum.js";
import { createDeterministicMetadata, createIssueCollection, createStructuralReadinessScore, createTextBlock, } from "../../value-objects/publishing-shared.vo.js";
const assertId = (value, field) => {
    createTextBlock(value, field);
    return value;
};
export const createPublishableCandidate = (input) => {
    if (!Object.values(PublishableCandidateStatus).includes(input.candidate_status)) {
        throw new ValidationError("INVALID_PUBLISHABLE_CANDIDATE", "candidate_status is invalid");
    }
    return deepFreeze({
        ...input,
        market_draft_pipeline_id: assertId(input.market_draft_pipeline_id, "market_draft_pipeline_id"),
        title_set_id: assertId(input.title_set_id, "title_set_id"),
        resolution_summary_id: assertId(input.resolution_summary_id, "resolution_summary_id"),
        rulebook_compilation_id: assertId(input.rulebook_compilation_id, "rulebook_compilation_id"),
        structural_readiness_score: createStructuralReadinessScore(input.structural_readiness_score),
        blocking_issues: createIssueCollection(input.blocking_issues, "blocking_issues"),
        warnings: createIssueCollection(input.warnings, "warnings"),
        compatibility_metadata: createDeterministicMetadata(input.compatibility_metadata, "compatibility_metadata"),
    });
};
//# sourceMappingURL=publishable-candidate.entity.js.map