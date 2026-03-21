import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type QueuePanelViewId = Branded<string, "QueuePanelViewId">;
export type CandidateListViewId = Branded<string, "CandidateListViewId">;
export type CandidateDetailViewId = Branded<string, "CandidateDetailViewId">;
export type ArtifactInspectionViewId = Branded<string, "ArtifactInspectionViewId">;
export type AuditTimelineViewId = Branded<string, "AuditTimelineViewId">;
export type ReadinessPanelViewId = Branded<string, "ReadinessPanelViewId">;
export type ActionSurfaceId = Branded<string, "ActionSurfaceId">;
export type ConsoleNavigationStateId = Branded<string, "ConsoleNavigationStateId">;
export type PermissionAwareViewStateId = Branded<string, "PermissionAwareViewStateId">;
export type OperationsConsoleCompatibilityResultId = Branded<string, "OperationsConsoleCompatibilityResultId">;

export const createQueuePanelViewId = (value: string): QueuePanelViewId =>
  createPrefixedId(value, "qpv_", "QueuePanelViewId") as QueuePanelViewId;
export const createCandidateListViewId = (value: string): CandidateListViewId =>
  createPrefixedId(value, "clv_", "CandidateListViewId") as CandidateListViewId;
export const createCandidateDetailViewId = (value: string): CandidateDetailViewId =>
  createPrefixedId(value, "cdv_", "CandidateDetailViewId") as CandidateDetailViewId;
export const createArtifactInspectionViewId = (value: string): ArtifactInspectionViewId =>
  createPrefixedId(value, "aiv_", "ArtifactInspectionViewId") as ArtifactInspectionViewId;
export const createAuditTimelineViewId = (value: string): AuditTimelineViewId =>
  createPrefixedId(value, "atv_", "AuditTimelineViewId") as AuditTimelineViewId;
export const createReadinessPanelViewId = (value: string): ReadinessPanelViewId =>
  createPrefixedId(value, "rpv_", "ReadinessPanelViewId") as ReadinessPanelViewId;
export const createActionSurfaceId = (value: string): ActionSurfaceId =>
  createPrefixedId(value, "asf_", "ActionSurfaceId") as ActionSurfaceId;
export const createConsoleNavigationStateId = (value: string): ConsoleNavigationStateId =>
  createPrefixedId(value, "cns_", "ConsoleNavigationStateId") as ConsoleNavigationStateId;
export const createPermissionAwareViewStateId = (value: string): PermissionAwareViewStateId =>
  createPrefixedId(value, "pvs_", "PermissionAwareViewStateId") as PermissionAwareViewStateId;
export const createOperationsConsoleCompatibilityResultId = (value: string): OperationsConsoleCompatibilityResultId =>
  createPrefixedId(value, "occ_", "OperationsConsoleCompatibilityResultId") as OperationsConsoleCompatibilityResultId;
