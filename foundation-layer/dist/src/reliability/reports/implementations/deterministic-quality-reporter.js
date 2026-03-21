import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { createQualityReport } from "../entities/quality-report.entity.js";
import { createQualityReportId } from "../../value-objects/reliability-ids.vo.js";
export class DeterministicQualityReporter {
    generate(input) {
        return createQualityReport({
            id: createQualityReportId("qrp_qualityrep1"),
            version: createEntityVersion(1),
            report_scope: input.report_scope,
            generated_at: createTimestamp("1970-01-01T00:00:00.000Z"),
            summary: input.summary,
            key_findings: input.key_findings,
            metrics_summary: input.metrics_summary,
            unresolved_issues: input.unresolved_issues,
            recommendations: input.recommendations,
        });
    }
}
//# sourceMappingURL=deterministic-quality-reporter.js.map