import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ReportScope } from "../../enums/report-scope.enum.js";
import { createNonEmptySummary } from "../../value-objects/non-empty-summary.vo.js";
import { createBlockingReasonCollection } from "../../value-objects/blocking-reason.vo.js";
import { createRecommendationItemCollection } from "../../value-objects/recommendation-item.vo.js";
export const createQualityReport = (input) => {
    if (!Object.values(ReportScope).includes(input.report_scope)) {
        throw new ValidationError("INVALID_QUALITY_REPORT", "report_scope is invalid");
    }
    return deepFreeze({
        ...input,
        summary: createNonEmptySummary(input.summary),
        unresolved_issues: createBlockingReasonCollection(input.unresolved_issues),
        recommendations: createRecommendationItemCollection(input.recommendations),
        key_findings: deepFreeze(input.key_findings.map((item) => item.trim()).filter((item) => item.length > 0)),
        metrics_summary: deepFreeze([...input.metrics_summary]),
    });
};
//# sourceMappingURL=quality-report.entity.js.map