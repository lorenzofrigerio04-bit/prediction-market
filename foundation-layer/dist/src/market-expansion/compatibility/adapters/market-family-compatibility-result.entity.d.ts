import { FamilyCompatibilityStatus } from "../../enums/family-compatibility-status.enum.js";
import type { MarketFamilyCompatibilityResultId } from "../../value-objects/market-expansion-ids.vo.js";
import { type ExpansionNote } from "../../value-objects/market-expansion-shared.vo.js";
export type FamilyCompatibilityTarget = "market_draft_pipeline" | "publishable_candidate" | "publication_ready_artifact" | "editorial_pipeline";
export type MarketFamilyCompatibilityResult = Readonly<{
    id: MarketFamilyCompatibilityResultId;
    target: FamilyCompatibilityTarget;
    status: FamilyCompatibilityStatus;
    mapped_artifact: Readonly<Record<string, unknown>>;
    notes: readonly ExpansionNote[];
}>;
export declare const createMarketFamilyCompatibilityResult: (input: MarketFamilyCompatibilityResult) => MarketFamilyCompatibilityResult;
//# sourceMappingURL=market-family-compatibility-result.entity.d.ts.map