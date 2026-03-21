import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt } from "../../validators/common/validation-result.js";
const validateCompatibility = (candidate, queueEntry) => {
    const issues = [];
    if (candidate.id !== queueEntry.publishable_candidate_id) {
        issues.push(errorIssue("PUBLISHABLE_CANDIDATE_ID_MISMATCH", "/publishable_candidate_id", "review queue entry must reference the provided publishable candidate"));
    }
    if (candidate.blocking_issues.length > 0 && queueEntry.blocking_flags.length === 0) {
        issues.push(errorIssue("BLOCKING_FLAGS_NOT_CARRIED_OVER", "/blocking_flags", "queue entry must include blocking flags derived from publishable candidate blocking issues"));
    }
    return issues;
};
export const validatePublishableCandidateEditorialCompatibility = (input, options) => buildValidationReport("PublishableCandidateEditorialCompatibility", input.candidate.id, validateCompatibility(input.candidate, input.queue_entry), resolveGeneratedAt(options));
//# sourceMappingURL=validate-publishable-candidate-editorial-compatibility.js.map