import { createValidationReport, errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import { createTimestamp } from "../../value-objects/timestamp.vo.js";
import { ContractStatus } from "../enums/contract-status.enum.js";
import { PackageStatus } from "../enums/package-status.enum.js";
import { ReadinessStatus } from "../enums/readiness-status.enum.js";
import { SchedulingStatus } from "../enums/scheduling-status.enum.js";
import type { LiveIntegrationPipelineInput } from "../contracts/interfaces/publication-validator.js";
import { validatePublicationPackage } from "../packaging/validators/validate-publication-package.js";
import { validatePublicationHandoff } from "../handoff/validators/validate-publication-handoff.js";
import { validateSchedulingCandidate } from "../scheduling/validators/validate-scheduling-candidate.js";
import { validateLivePublicationContract } from "../contracts/validators/validate-live-publication-contract.js";
import { validateDeliveryReadinessReport } from "../readiness/validators/validate-delivery-readiness-report.js";

const mergeIssues = (...issues: readonly (readonly ValidationIssue[])[]): readonly ValidationIssue[] =>
  issues.flat();

export const validateLiveIntegrationPipeline = (
  input: LiveIntegrationPipelineInput,
): ValidationReport => {
  const packageReport = validatePublicationPackage(input.publication_package);
  const handoffReport = validatePublicationHandoff(input.publication_handoff);
  const schedulingReport = validateSchedulingCandidate(input.scheduling_candidate);
  const contractReport = validateLivePublicationContract(input.live_publication_contract);
  const readinessReport = validateDeliveryReadinessReport(input.delivery_readiness_report);

  const crossIssues: ValidationIssue[] = [];

  if (input.publication_handoff.publication_package_id !== input.publication_package.id) {
    crossIssues.push(
      errorIssue(
        "HANDOFF_PACKAGE_MISMATCH",
        "/publication_handoff/publication_package_id",
        "publication handoff must reference publication package id",
      ),
    );
  }
  if (input.scheduling_candidate.publication_package_id !== input.publication_package.id) {
    crossIssues.push(
      errorIssue(
        "SCHEDULING_PACKAGE_MISMATCH",
        "/scheduling_candidate/publication_package_id",
        "scheduling candidate must reference publication package id",
      ),
    );
  }
  if (input.live_publication_contract.publication_package_id !== input.publication_package.id) {
    crossIssues.push(
      errorIssue(
        "CONTRACT_PACKAGE_MISMATCH",
        "/live_publication_contract/publication_package_id",
        "live publication contract must reference publication package id",
      ),
    );
  }
  if (input.delivery_readiness_report.publication_package_id !== input.publication_package.id) {
    crossIssues.push(
      errorIssue(
        "READINESS_PACKAGE_MISMATCH",
        "/delivery_readiness_report/publication_package_id",
        "delivery readiness report must reference publication package id",
      ),
    );
  }
  if (
    (input.delivery_readiness_report.readiness_status === ReadinessStatus.BLOCKED ||
      input.delivery_readiness_report.readiness_status === ReadinessStatus.FAILED) &&
    input.scheduling_candidate.scheduling_status === SchedulingStatus.READY
  ) {
    crossIssues.push(
      errorIssue(
        "READY_SCHEDULING_BLOCKED_BY_READINESS",
        "/scheduling_candidate/scheduling_status",
        "scheduling candidate cannot be READY when delivery readiness is BLOCKED or FAILED",
      ),
    );
  }
  if (
    input.publication_package.package_status === PackageStatus.INVALID &&
    input.live_publication_contract.contract_status === ContractStatus.READY
  ) {
    crossIssues.push(
      errorIssue(
        "READY_CONTRACT_FROM_INVALID_PACKAGE",
        "/live_publication_contract/contract_status",
        "READY live publication contract cannot be built from INVALID package",
      ),
    );
  }

  const issues = mergeIssues(
    packageReport.issues,
    handoffReport.issues,
    schedulingReport.issues,
    contractReport.issues,
    readinessReport.issues,
    crossIssues,
  );

  return createValidationReport({
    targetType: "LiveIntegrationPipeline",
    targetId: input.publication_package.id,
    isValid: issues.length === 0,
    issues,
    generatedAt: createTimestamp("1970-01-01T00:00:00.000Z"),
  });
};
