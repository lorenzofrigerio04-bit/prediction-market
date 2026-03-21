import { createPrefixedId } from "../../common/utils/id.js";
export const createGoldenDatasetEntryId = (value) => createPrefixedId(value, "gde_", "GoldenDatasetEntryId");
export const createRegressionCaseId = (value) => createPrefixedId(value, "rgc_", "RegressionCaseId");
export const createAdversarialCaseId = (value) => createPrefixedId(value, "adv_", "AdversarialCaseId");
export const createModuleHealthMetricId = (value) => createPrefixedId(value, "mhm_", "ModuleHealthMetricId");
export const createPipelineHealthSnapshotId = (value) => createPrefixedId(value, "phs_", "PipelineHealthSnapshotId");
export const createReleaseGateEvaluationId = (value) => createPrefixedId(value, "rge_", "ReleaseGateEvaluationId");
export const createQualityReportId = (value) => createPrefixedId(value, "qrp_", "QualityReportId");
export const createObservabilityEventId = (value) => createPrefixedId(value, "obe_", "ObservabilityEventId");
//# sourceMappingURL=reliability-ids.vo.js.map