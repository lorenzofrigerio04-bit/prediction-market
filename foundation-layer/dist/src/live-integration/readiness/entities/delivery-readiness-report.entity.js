import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import { createBlockingIssue, } from "../../value-objects/blocking-issue.vo.js";
import { createDeliveryReadinessReportId, } from "../../value-objects/delivery-readiness-report-id.vo.js";
import { createPublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { createWarningMessage } from "../../value-objects/warning-message.vo.js";
export const createDeliveryReadinessReport = (input) => {
    if (!Object.values(ReadinessStatus).includes(input.readiness_status)) {
        throw new ValidationError("INVALID_DELIVERY_READINESS_REPORT", "readiness_status is invalid");
    }
    const blockingIssues = input.blocking_issues.map(createBlockingIssue);
    if ((input.readiness_status === ReadinessStatus.FAILED ||
        input.readiness_status === ReadinessStatus.BLOCKED) &&
        blockingIssues.length === 0) {
        throw new ValidationError("INVALID_DELIVERY_READINESS_REPORT", "FAILED/BLOCKED readiness requires blocking_issues");
    }
    if (input.readiness_status === ReadinessStatus.READY && blockingIssues.length > 0) {
        throw new ValidationError("INVALID_DELIVERY_READINESS_REPORT", "READY readiness cannot include blocking_issues");
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
//# sourceMappingURL=delivery-readiness-report.entity.js.map