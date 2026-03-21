import { createPrefixedId } from "../../common/utils/id.js";
export const createMarketDraftPipelineId = (value) => createPrefixedId(value, "mdp_", "MarketDraftPipelineId");
export const createTitleSetId = (value) => createPrefixedId(value, "tset_", "TitleSetId");
export const createResolutionSummaryId = (value) => createPrefixedId(value, "rsum_", "ResolutionSummaryId");
export const createRulebookSectionId = (value) => createPrefixedId(value, "rbsec_", "RulebookSectionId");
export const createRulebookCompilationId = (value) => createPrefixedId(value, "rbcmp_", "RulebookCompilationId");
export const createPublishableCandidateId = (value) => createPrefixedId(value, "pcnd_", "PublishableCandidateId");
//# sourceMappingURL=publishing-ids.vo.js.map