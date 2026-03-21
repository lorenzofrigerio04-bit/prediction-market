import { createValidationReport, errorIssue, type ValidationIssue } from "../../../entities/validation-report.entity.js";
import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import type { LiveIntegrationPipelineInput, PublicationValidator } from "../interfaces/publication-validator.js";
import { validateLiveIntegrationPipeline } from "../../validators/validate-live-integration-pipeline.js";
import { validatePublicationPackage } from "../../packaging/validators/validate-publication-package.js";
import { validatePublicationHandoff } from "../../handoff/validators/validate-publication-handoff.js";
import { validateSchedulingCandidate } from "../../scheduling/validators/validate-scheduling-candidate.js";
import { validateLivePublicationContract } from "../validators/validate-live-publication-contract.js";

const mergeReports = (
  targetType: string,
  targetId: string,
  issues: readonly ValidationIssue[],
) =>
  createValidationReport({
    targetType,
    targetId,
    isValid: issues.length === 0,
    issues,
    generatedAt: createTimestamp("1970-01-01T00:00:00.000Z"),
  });

export class DeterministicPublicationValidator implements PublicationValidator {
  validatePackage(input: LiveIntegrationPipelineInput["publication_package"]) {
    return validatePublicationPackage(input);
  }

  validateHandoff(input: LiveIntegrationPipelineInput["publication_handoff"]) {
    return validatePublicationHandoff(input);
  }

  validateSchedulingCandidate(input: LiveIntegrationPipelineInput["scheduling_candidate"]) {
    return validateSchedulingCandidate(input);
  }

  validateLiveContract(input: LiveIntegrationPipelineInput["live_publication_contract"]) {
    return validateLivePublicationContract(input);
  }

  validatePipeline(input: LiveIntegrationPipelineInput) {
    const pipeline = validateLiveIntegrationPipeline(input);
    const issues = [...pipeline.issues];
    if (
      input.live_publication_contract.publication_package_id !== input.publication_package.id
    ) {
      issues.push(
        errorIssue(
          "PIPELINE_PACKAGE_ID_MISMATCH",
          "/live_publication_contract/publication_package_id",
          "live contract package id must match pipeline publication package id",
        ),
      );
    }
    return mergeReports("LiveIntegrationPipeline", input.publication_package.id, issues);
  }
}
