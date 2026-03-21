import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type RaceMarketDefinitionId = Branded<string, "RaceMarketDefinitionId">;
export type SequenceMarketDefinitionId = Branded<string, "SequenceMarketDefinitionId">;
export type ConditionalMarketDefinitionId = Branded<string, "ConditionalMarketDefinitionId">;
export type DependencyLinkId = Branded<string, "DependencyLinkId">;
export type AdvancedOutcomeGenerationResultId = Branded<string, "AdvancedOutcomeGenerationResultId">;
export type AdvancedContractValidationReportId = Branded<string, "AdvancedContractValidationReportId">;
export type AdvancedMarketCompatibilityResultId = Branded<string, "AdvancedMarketCompatibilityResultId">;

export const createRaceMarketDefinitionId = (value: string): RaceMarketDefinitionId =>
  createPrefixedId(value, "frc_", "RaceMarketDefinitionId") as RaceMarketDefinitionId;

export const createSequenceMarketDefinitionId = (value: string): SequenceMarketDefinitionId =>
  createPrefixedId(value, "fse_", "SequenceMarketDefinitionId") as SequenceMarketDefinitionId;

export const createConditionalMarketDefinitionId = (value: string): ConditionalMarketDefinitionId =>
  createPrefixedId(value, "fco_", "ConditionalMarketDefinitionId") as ConditionalMarketDefinitionId;

export const createDependencyLinkId = (value: string): DependencyLinkId =>
  createPrefixedId(value, "fdp_", "DependencyLinkId") as DependencyLinkId;

export const createAdvancedOutcomeGenerationResultId = (
  value: string,
): AdvancedOutcomeGenerationResultId =>
  createPrefixedId(value, "fgr_", "AdvancedOutcomeGenerationResultId") as AdvancedOutcomeGenerationResultId;

export const createAdvancedContractValidationReportId = (
  value: string,
): AdvancedContractValidationReportId =>
  createPrefixedId(
    value,
    "fvr_",
    "AdvancedContractValidationReportId",
  ) as AdvancedContractValidationReportId;

export const createAdvancedMarketCompatibilityResultId = (
  value: string,
): AdvancedMarketCompatibilityResultId =>
  createPrefixedId(
    value,
    "fcp_",
    "AdvancedMarketCompatibilityResultId",
  ) as AdvancedMarketCompatibilityResultId;
