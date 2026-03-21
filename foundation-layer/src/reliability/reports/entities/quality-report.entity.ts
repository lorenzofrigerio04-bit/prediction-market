import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { ReportScope } from "../../enums/report-scope.enum.js";
import type { ModuleHealthMetric } from "../../metrics/entities/module-health-metric.entity.js";
import { createNonEmptySummary, type NonEmptySummary } from "../../value-objects/non-empty-summary.vo.js";
import type { QualityReportId } from "../../value-objects/reliability-ids.vo.js";
import type { BlockingReason } from "../../value-objects/blocking-reason.vo.js";
import { createBlockingReasonCollection } from "../../value-objects/blocking-reason.vo.js";
import type { RecommendationItem } from "../../value-objects/recommendation-item.vo.js";
import { createRecommendationItemCollection } from "../../value-objects/recommendation-item.vo.js";

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

export const createQualityReport = (
  input: Omit<QualityReport, "summary" | "recommendations"> & {
    summary: string | NonEmptySummary;
    recommendations: readonly string[] | readonly RecommendationItem[];
  },
): QualityReport => {
  if (!Object.values(ReportScope).includes(input.report_scope)) {
    throw new ValidationError("INVALID_QUALITY_REPORT", "report_scope is invalid");
  }
  return deepFreeze({
    ...input,
    summary: createNonEmptySummary(input.summary),
    unresolved_issues: createBlockingReasonCollection(input.unresolved_issues),
    recommendations: createRecommendationItemCollection(input.recommendations as readonly string[]),
    key_findings: deepFreeze(input.key_findings.map((item) => item.trim()).filter((item) => item.length > 0)),
    metrics_summary: deepFreeze([...input.metrics_summary]),
  });
};
