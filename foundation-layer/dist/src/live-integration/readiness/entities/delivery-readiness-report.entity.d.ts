import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import { type BlockingIssue } from "../../value-objects/blocking-issue.vo.js";
import { type DeliveryReadinessReportId } from "../../value-objects/delivery-readiness-report-id.vo.js";
import type { PublicationPackageId } from "../../value-objects/publication-package-id.vo.js";
import { type WarningMessage } from "../../value-objects/warning-message.vo.js";
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
export declare const createDeliveryReadinessReport: (input: DeliveryReadinessReportInput) => DeliveryReadinessReport;
//# sourceMappingURL=delivery-readiness-report.entity.d.ts.map