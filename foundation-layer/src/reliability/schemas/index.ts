import { adversarialCaseSchema } from "./adversarial-case.schema.js";
import { goldenDatasetEntrySchema } from "./golden-dataset-entry.schema.js";
import { moduleHealthMetricSchema } from "./module-health-metric.schema.js";
import { observabilityEventSchema } from "./observability-event.schema.js";
import { pipelineHealthSnapshotSchema } from "./pipeline-health-snapshot.schema.js";
import { qualityReportSchema } from "./quality-report.schema.js";
import { regressionCaseSchema } from "./regression-case.schema.js";
import { releaseGateEvaluationSchema } from "./release-gate-evaluation.schema.js";

export const reliabilitySchemas = [
  goldenDatasetEntrySchema,
  regressionCaseSchema,
  adversarialCaseSchema,
  moduleHealthMetricSchema,
  pipelineHealthSnapshotSchema,
  releaseGateEvaluationSchema,
  qualityReportSchema,
  observabilityEventSchema,
] as const;

export {
  goldenDatasetEntrySchema,
  regressionCaseSchema,
  adversarialCaseSchema,
  moduleHealthMetricSchema,
  pipelineHealthSnapshotSchema,
  releaseGateEvaluationSchema,
  qualityReportSchema,
  observabilityEventSchema,
};
