import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type MarketFamilyId = Branded<string, "MarketFamilyId">;
export type ExpansionStrategyId = Branded<string, "ExpansionStrategyId">;
export type FlagshipMarketSelectionId = Branded<string, "FlagshipMarketSelectionId">;
export type SatelliteMarketDefinitionId = Branded<string, "SatelliteMarketDefinitionId">;
export type DerivativeMarketDefinitionId = Branded<string, "DerivativeMarketDefinitionId">;
export type MarketRelationshipId = Branded<string, "MarketRelationshipId">;
export type ExpansionValidationReportId = Branded<string, "ExpansionValidationReportId">;
export type FamilyGenerationResultId = Branded<string, "FamilyGenerationResultId">;
export type CannibalizationCheckResultId = Branded<string, "CannibalizationCheckResultId">;
export type MarketFamilyCompatibilityResultId = Branded<string, "MarketFamilyCompatibilityResultId">;

export const createMarketFamilyId = (value: string): MarketFamilyId =>
  createPrefixedId(value, "mfy_", "MarketFamilyId") as MarketFamilyId;
export const createExpansionStrategyId = (value: string): ExpansionStrategyId =>
  createPrefixedId(value, "mes_", "ExpansionStrategyId") as ExpansionStrategyId;
export const createFlagshipMarketSelectionId = (value: string): FlagshipMarketSelectionId =>
  createPrefixedId(value, "mfs_", "FlagshipMarketSelectionId") as FlagshipMarketSelectionId;
export const createSatelliteMarketDefinitionId = (value: string): SatelliteMarketDefinitionId =>
  createPrefixedId(value, "msd_", "SatelliteMarketDefinitionId") as SatelliteMarketDefinitionId;
export const createDerivativeMarketDefinitionId = (value: string): DerivativeMarketDefinitionId =>
  createPrefixedId(value, "mdd_", "DerivativeMarketDefinitionId") as DerivativeMarketDefinitionId;
export const createMarketRelationshipId = (value: string): MarketRelationshipId =>
  createPrefixedId(value, "mrl_", "MarketRelationshipId") as MarketRelationshipId;
export const createExpansionValidationReportId = (value: string): ExpansionValidationReportId =>
  createPrefixedId(value, "mvr_", "ExpansionValidationReportId") as ExpansionValidationReportId;
export const createFamilyGenerationResultId = (value: string): FamilyGenerationResultId =>
  createPrefixedId(value, "mgr_", "FamilyGenerationResultId") as FamilyGenerationResultId;
export const createCannibalizationCheckResultId = (value: string): CannibalizationCheckResultId =>
  createPrefixedId(value, "mcc_", "CannibalizationCheckResultId") as CannibalizationCheckResultId;
export const createMarketFamilyCompatibilityResultId = (value: string): MarketFamilyCompatibilityResultId =>
  createPrefixedId(value, "mcp_", "MarketFamilyCompatibilityResultId") as MarketFamilyCompatibilityResultId;
