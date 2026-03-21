import type { Branded } from "../../common/types/branded.js";
export type GoldenDatasetEntryId = Branded<string, "GoldenDatasetEntryId">;
export type RegressionCaseId = Branded<string, "RegressionCaseId">;
export type AdversarialCaseId = Branded<string, "AdversarialCaseId">;
export type ModuleHealthMetricId = Branded<string, "ModuleHealthMetricId">;
export type PipelineHealthSnapshotId = Branded<string, "PipelineHealthSnapshotId">;
export type ReleaseGateEvaluationId = Branded<string, "ReleaseGateEvaluationId">;
export type QualityReportId = Branded<string, "QualityReportId">;
export type ObservabilityEventId = Branded<string, "ObservabilityEventId">;
export declare const createGoldenDatasetEntryId: (value: string) => GoldenDatasetEntryId;
export declare const createRegressionCaseId: (value: string) => RegressionCaseId;
export declare const createAdversarialCaseId: (value: string) => AdversarialCaseId;
export declare const createModuleHealthMetricId: (value: string) => ModuleHealthMetricId;
export declare const createPipelineHealthSnapshotId: (value: string) => PipelineHealthSnapshotId;
export declare const createReleaseGateEvaluationId: (value: string) => ReleaseGateEvaluationId;
export declare const createQualityReportId: (value: string) => QualityReportId;
export declare const createObservabilityEventId: (value: string) => ObservabilityEventId;
//# sourceMappingURL=reliability-ids.vo.d.ts.map