import type { QualityReport } from "../entities/quality-report.entity.js";
import type { ReportScope } from "../../enums/report-scope.enum.js";
import type { ModuleHealthMetric } from "../../metrics/entities/module-health-metric.entity.js";
import type { BlockingReason } from "../../value-objects/blocking-reason.vo.js";
export type QualityReporterInput = Readonly<{
    report_scope: ReportScope;
    summary: string;
    key_findings: readonly string[];
    metrics_summary: readonly ModuleHealthMetric[];
    unresolved_issues: readonly BlockingReason[];
    recommendations: readonly string[];
}>;
export interface QualityReporter {
    generate(input: QualityReporterInput): QualityReport;
}
//# sourceMappingURL=quality-reporter.d.ts.map