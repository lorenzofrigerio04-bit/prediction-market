import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type GoldenDatasetEntryId = Branded<string, "GoldenDatasetEntryId">;
export type RegressionCaseId = Branded<string, "RegressionCaseId">;
export type AdversarialCaseId = Branded<string, "AdversarialCaseId">;
export type ModuleHealthMetricId = Branded<string, "ModuleHealthMetricId">;
export type PipelineHealthSnapshotId = Branded<string, "PipelineHealthSnapshotId">;
export type ReleaseGateEvaluationId = Branded<string, "ReleaseGateEvaluationId">;
export type QualityReportId = Branded<string, "QualityReportId">;
export type ObservabilityEventId = Branded<string, "ObservabilityEventId">;

export const createGoldenDatasetEntryId = (value: string): GoldenDatasetEntryId =>
  createPrefixedId(value, "gde_", "GoldenDatasetEntryId") as GoldenDatasetEntryId;
export const createRegressionCaseId = (value: string): RegressionCaseId =>
  createPrefixedId(value, "rgc_", "RegressionCaseId") as RegressionCaseId;
export const createAdversarialCaseId = (value: string): AdversarialCaseId =>
  createPrefixedId(value, "adv_", "AdversarialCaseId") as AdversarialCaseId;
export const createModuleHealthMetricId = (value: string): ModuleHealthMetricId =>
  createPrefixedId(value, "mhm_", "ModuleHealthMetricId") as ModuleHealthMetricId;
export const createPipelineHealthSnapshotId = (value: string): PipelineHealthSnapshotId =>
  createPrefixedId(value, "phs_", "PipelineHealthSnapshotId") as PipelineHealthSnapshotId;
export const createReleaseGateEvaluationId = (value: string): ReleaseGateEvaluationId =>
  createPrefixedId(value, "rge_", "ReleaseGateEvaluationId") as ReleaseGateEvaluationId;
export const createQualityReportId = (value: string): QualityReportId =>
  createPrefixedId(value, "qrp_", "QualityReportId") as QualityReportId;
export const createObservabilityEventId = (value: string): ObservabilityEventId =>
  createPrefixedId(value, "obe_", "ObservabilityEventId") as ObservabilityEventId;
