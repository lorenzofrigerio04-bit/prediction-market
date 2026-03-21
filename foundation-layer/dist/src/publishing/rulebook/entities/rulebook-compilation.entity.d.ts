import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { CompilationStatus } from "../../enums/compilation-status.enum.js";
import { RulebookSectionType } from "../../enums/rulebook-section-type.enum.js";
import type { MarketDraftPipelineId, RulebookCompilationId } from "../../value-objects/publishing-ids.vo.js";
import { type DeterministicMetadata } from "../../value-objects/publishing-shared.vo.js";
import { type RulebookSection } from "./rulebook-section.entity.js";
export declare const REQUIRED_RULEBOOK_SECTION_TYPES: readonly RulebookSectionType[];
export type RulebookCompilation = Readonly<{
    id: RulebookCompilationId;
    version: EntityVersion;
    market_draft_pipeline_id: MarketDraftPipelineId;
    canonical_question: RulebookSection;
    contract_definition: RulebookSection;
    resolution_criteria: RulebookSection;
    source_policy: RulebookSection;
    time_policy: RulebookSection;
    edge_case_section: RulebookSection;
    invalidation_section: RulebookSection;
    examples_section: RulebookSection;
    included_sections: readonly RulebookSection[];
    compilation_status: CompilationStatus;
    compilation_metadata: DeterministicMetadata;
}>;
export declare const createRulebookCompilation: (input: RulebookCompilation) => RulebookCompilation;
//# sourceMappingURL=rulebook-compilation.entity.d.ts.map