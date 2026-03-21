import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { GenerationStatus } from "../../enums/generation-status.enum.js";
import type { FamilyGenerationResultId, MarketFamilyId } from "../../value-objects/market-expansion-ids.vo.js";
import { type ConfidenceScore01, type ExpansionNote, type MarketRef } from "../../value-objects/market-expansion-shared.vo.js";
export type FamilyGenerationResult = Readonly<{
    id: FamilyGenerationResultId;
    version: EntityVersion;
    market_family_id: MarketFamilyId;
    generated_market_refs: readonly MarketRef[];
    flagship_ref: MarketRef;
    generation_status: GenerationStatus;
    generation_confidence: ConfidenceScore01;
    output_notes_nullable: ExpansionNote | null;
}>;
export declare const createFamilyGenerationResult: (input: FamilyGenerationResult) => FamilyGenerationResult;
//# sourceMappingURL=family-generation-result.entity.d.ts.map