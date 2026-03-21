import { createValidationReport, errorIssue } from "../../../entities/validation-report.entity.js";
import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { validateLiveIntegrationPipeline } from "../../validators/validate-live-integration-pipeline.js";
import { validatePublicationPackage } from "../../packaging/validators/validate-publication-package.js";
import { validatePublicationHandoff } from "../../handoff/validators/validate-publication-handoff.js";
import { validateSchedulingCandidate } from "../../scheduling/validators/validate-scheduling-candidate.js";
import { validateLivePublicationContract } from "../validators/validate-live-publication-contract.js";
const mergeReports = (targetType, targetId, issues) => createValidationReport({
    targetType,
    targetId,
    isValid: issues.length === 0,
    issues,
    generatedAt: createTimestamp("1970-01-01T00:00:00.000Z"),
});
export class DeterministicPublicationValidator {
    validatePackage(input) {
        return validatePublicationPackage(input);
    }
    validateHandoff(input) {
        return validatePublicationHandoff(input);
    }
    validateSchedulingCandidate(input) {
        return validateSchedulingCandidate(input);
    }
    validateLiveContract(input) {
        return validateLivePublicationContract(input);
    }
    validatePipeline(input) {
        const pipeline = validateLiveIntegrationPipeline(input);
        const issues = [...pipeline.issues];
        if (input.live_publication_contract.publication_package_id !== input.publication_package.id) {
            issues.push(errorIssue("PIPELINE_PACKAGE_ID_MISMATCH", "/live_publication_contract/publication_package_id", "live contract package id must match pipeline publication package id"));
        }
        return mergeReports("LiveIntegrationPipeline", input.publication_package.id, issues);
    }
}
//# sourceMappingURL=deterministic-publication-validator.js.map