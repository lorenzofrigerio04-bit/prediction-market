import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { TitleGenerationStatus } from "../../enums/title-generation-status.enum.js";
import type { MarketDraftPipelineId, TitleSetId } from "../../value-objects/publishing-ids.vo.js";
import { type DeterministicMetadata } from "../../value-objects/publishing-shared.vo.js";
export type TitleSet = Readonly<{
    id: TitleSetId;
    version: EntityVersion;
    market_draft_pipeline_id: MarketDraftPipelineId;
    canonical_title: string;
    display_title: string;
    subtitle: string | null;
    title_generation_status: TitleGenerationStatus;
    generation_metadata: DeterministicMetadata;
}>;
export declare const createTitleSet: (input: TitleSet) => TitleSet;
//# sourceMappingURL=title-set.entity.d.ts.map