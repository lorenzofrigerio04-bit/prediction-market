import { FinalReadinessStatus } from "../../../editorial/enums/final-readiness-status.enum.js";
import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { PackageStatus } from "../../enums/package-status.enum.js";
import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import { createDeliveryReadinessReport } from "../entities/delivery-readiness-report.entity.js";
import { createDeliveryReadinessReportId } from "../../value-objects/delivery-readiness-report-id.vo.js";
const mapFinalReadinessStatus = (status) => {
    switch (status) {
        case FinalReadinessStatus.APPROVED:
            return ReadinessStatus.READY;
        case FinalReadinessStatus.CONDITIONALLY_READY:
            return ReadinessStatus.WARNING;
        case FinalReadinessStatus.REJECTED:
            return ReadinessStatus.FAILED;
        case FinalReadinessStatus.NOT_READY:
        default:
            return ReadinessStatus.BLOCKED;
    }
};
export class DeterministicDeliveryReadinessEvaluator {
    determineReadinessStatus(input) {
        if (input.publication_package.package_status === PackageStatus.INVALID) {
            return ReadinessStatus.FAILED;
        }
        return mapFinalReadinessStatus(input.publication_ready_artifact.final_readiness_status);
    }
    evaluate(input) {
        const readinessStatus = this.determineReadinessStatus(input);
        const token = createDeterministicToken(`${input.publication_package.id}|${input.publication_ready_artifact.id}|${input.validated_at}|${readinessStatus}`);
        const blockingIssues = readinessStatus === ReadinessStatus.FAILED || readinessStatus === ReadinessStatus.BLOCKED
            ? ["readiness gate failed for live publication"]
            : [];
        const warnings = readinessStatus === ReadinessStatus.WARNING ? ["publication is conditionally ready"] : [];
        return createDeliveryReadinessReport({
            id: createDeliveryReadinessReportId(`drrp_${token}rdy`),
            publication_package_id: input.publication_package.id,
            readiness_status: readinessStatus,
            blocking_issues: blockingIssues,
            warnings,
            validated_at: input.validated_at,
        });
    }
}
//# sourceMappingURL=deterministic-delivery-readiness-evaluator.js.map