import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import {
  createBlockingIssue,
  type BlockingIssue,
} from "../../value-objects/blocking-issue.vo.js";
import {
  createDeliveryReadinessReportId,
  type DeliveryReadinessReportId,
} from "../../value-objects/delivery-readiness-report-id.vo.js";
import type { PublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { createPublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { createWarningMessage, type WarningMessage } from "../../value-objects/warning-message.vo.js";

export type DeliveryReadinessReport = Readonly<{
  id: DeliveryReadinessReportId;
  publication_package_id: PublicationPackageId;
  readiness_status: ReadinessStatus;
  blocking_issues: readonly BlockingIssue[];
  warnings: readonly WarningMessage[];
  validated_at: Timestamp;
}>;

export type DeliveryReadinessReportInput = Readonly<{
  id: string;
  publication_package_id: string;
  readiness_status: ReadinessStatus;
  blocking_issues: readonly string[];
  warnings: readonly string[];
  validated_at: string;
}>;

export const createDeliveryReadinessReport = (
  input: DeliveryReadinessReportInput,
): DeliveryReadinessReport => {
  if (!Object.values(ReadinessStatus).includes(input.readiness_status)) {
    throw new ValidationError("INVALID_DELIVERY_READINESS_REPORT", "readiness_status is invalid");
  }
  const blockingIssues = input.blocking_issues.map(createBlockingIssue);
  if (
    (input.readiness_status === ReadinessStatus.FAILED ||
      input.readiness_status === ReadinessStatus.BLOCKED) &&
    blockingIssues.length === 0
  ) {
    throw new ValidationError(
      "INVALID_DELIVERY_READINESS_REPORT",
      "FAILED/BLOCKED readiness requires blocking_issues",
    );
  }
  if (input.readiness_status === ReadinessStatus.READY && blockingIssues.length > 0) {
    throw new ValidationError(
      "INVALID_DELIVERY_READINESS_REPORT",
      "READY readiness cannot include blocking_issues",
    );
  }
  return deepFreeze({
    id: createDeliveryReadinessReportId(input.id),
    publication_package_id: createPublicationPackageId(input.publication_package_id),
    readiness_status: input.readiness_status,
    blocking_issues: deepFreeze([...blockingIssues]),
    warnings: deepFreeze(input.warnings.map(createWarningMessage)),
    validated_at: createTimestamp(input.validated_at),
  });
};
