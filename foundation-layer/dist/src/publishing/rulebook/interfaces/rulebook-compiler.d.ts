import type { MarketDraftPipeline } from "../../../market-design/drafting/entities/market-draft-pipeline.entity.js";
import type { RulebookCompilation } from "../entities/rulebook-compilation.entity.js";
import type { RulebookDraftContract } from "../contracts/rulebook-draft.contract.js";
export interface RulebookCompilerInput {
    pipeline: MarketDraftPipeline;
    foundation_rulebook_draft_nullable?: RulebookDraftContract | null;
}
export interface RulebookCompiler {
    compile(input: RulebookCompilerInput): RulebookCompilation;
}
//# sourceMappingURL=rulebook-compiler.d.ts.map