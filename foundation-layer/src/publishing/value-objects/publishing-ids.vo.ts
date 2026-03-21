import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type MarketDraftPipelineId = Branded<string, "MarketDraftPipelineId">;
export type TitleSetId = Branded<string, "TitleSetId">;
export type ResolutionSummaryId = Branded<string, "ResolutionSummaryId">;
export type RulebookSectionId = Branded<string, "RulebookSectionId">;
export type RulebookCompilationId = Branded<string, "RulebookCompilationId">;
export type PublishableCandidateId = Branded<string, "PublishableCandidateId">;

export const createMarketDraftPipelineId = (value: string): MarketDraftPipelineId =>
  createPrefixedId(value, "mdp_", "MarketDraftPipelineId") as MarketDraftPipelineId;

export const createTitleSetId = (value: string): TitleSetId =>
  createPrefixedId(value, "tset_", "TitleSetId") as TitleSetId;

export const createResolutionSummaryId = (value: string): ResolutionSummaryId =>
  createPrefixedId(value, "rsum_", "ResolutionSummaryId") as ResolutionSummaryId;

export const createRulebookSectionId = (value: string): RulebookSectionId =>
  createPrefixedId(value, "rbsec_", "RulebookSectionId") as RulebookSectionId;

export const createRulebookCompilationId = (value: string): RulebookCompilationId =>
  createPrefixedId(value, "rbcmp_", "RulebookCompilationId") as RulebookCompilationId;

export const createPublishableCandidateId = (value: string): PublishableCandidateId =>
  createPrefixedId(value, "pcnd_", "PublishableCandidateId") as PublishableCandidateId;
