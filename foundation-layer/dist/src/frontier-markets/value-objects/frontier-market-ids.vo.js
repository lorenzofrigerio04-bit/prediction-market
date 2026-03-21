import { createPrefixedId } from "../../common/utils/id.js";
export const createRaceMarketDefinitionId = (value) => createPrefixedId(value, "frc_", "RaceMarketDefinitionId");
export const createSequenceMarketDefinitionId = (value) => createPrefixedId(value, "fse_", "SequenceMarketDefinitionId");
export const createConditionalMarketDefinitionId = (value) => createPrefixedId(value, "fco_", "ConditionalMarketDefinitionId");
export const createDependencyLinkId = (value) => createPrefixedId(value, "fdp_", "DependencyLinkId");
export const createAdvancedOutcomeGenerationResultId = (value) => createPrefixedId(value, "fgr_", "AdvancedOutcomeGenerationResultId");
export const createAdvancedContractValidationReportId = (value) => createPrefixedId(value, "fvr_", "AdvancedContractValidationReportId");
export const createAdvancedMarketCompatibilityResultId = (value) => createPrefixedId(value, "fcp_", "AdvancedMarketCompatibilityResultId");
//# sourceMappingURL=frontier-market-ids.vo.js.map