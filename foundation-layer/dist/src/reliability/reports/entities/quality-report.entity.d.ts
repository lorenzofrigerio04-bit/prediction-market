import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { ReportScope } from "../../enums/report-scope.enum.js";
import type { ModuleHealthMetric } from "../../metrics/entities/module-health-metric.entity.js";
import { type NonEmptySummary } from "../../value-objects/non-empty-summary.vo.js";
import type { QualityReportId } from "../../value-objects/reliability-ids.vo.js";
import type { BlockingReason } from "../../value-objects/blocking-reason.vo.js";
import type { RecommendationItem } from "../../value-objects/recommendation-item.vo.js";
export type QualityReport = Readonly<{
    id: QualityReportId;
    version: EntityVersion;
    report_scope: ReportScope;
    generated_at: Timestamp;
    summary: NonEmptySummary;
    key_findings: readonly string[];
    metrics_summary: readonly ModuleHealthMetric[];
    unresolved_issues: readonly BlockingReason[];
    recommendations: readonly RecommendationItem[];
}>;
export declare const createQualityReport: (input: Omit<QualityReport, "summary" | "recommendations"> & {
    summary: string | NonEmptySummary;
    recommendations: readonly string[] | readonly RecommendationItem[];
}) => QualityReport;
//# sourceMappingURL=quality-report.entity.d.ts.map