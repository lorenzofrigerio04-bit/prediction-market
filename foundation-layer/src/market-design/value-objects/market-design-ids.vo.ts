import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type OpportunityAssessmentId = Branded<string, "OpportunityAssessmentId">;
export type ContractSelectionId = Branded<string, "ContractSelectionId">;
export type OutcomeGenerationResultId = Branded<string, "OutcomeGenerationResultId">;
export type DeadlineResolutionId = Branded<string, "DeadlineResolutionId">;
export type SourceHierarchySelectionId = Branded<string, "SourceHierarchySelectionId">;

export const createOpportunityAssessmentId = (value: string): OpportunityAssessmentId =>
  createPrefixedId(value, "opp_", "OpportunityAssessmentId") as OpportunityAssessmentId;

export const createContractSelectionId = (value: string): ContractSelectionId =>
  createPrefixedId(value, "csel_", "ContractSelectionId") as ContractSelectionId;

export const createOutcomeGenerationResultId = (value: string): OutcomeGenerationResultId =>
  createPrefixedId(value, "ogr_", "OutcomeGenerationResultId") as OutcomeGenerationResultId;

export const createDeadlineResolutionId = (value: string): DeadlineResolutionId =>
  createPrefixedId(value, "dlr_", "DeadlineResolutionId") as DeadlineResolutionId;

export const createSourceHierarchySelectionId = (value: string): SourceHierarchySelectionId =>
  createPrefixedId(value, "shs_", "SourceHierarchySelectionId") as SourceHierarchySelectionId;
