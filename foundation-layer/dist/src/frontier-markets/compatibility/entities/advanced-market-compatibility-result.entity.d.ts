import { AdvancedCompatibilityStatus } from "../../enums/advanced-compatibility-status.enum.js";
import type { AdvancedMarketCompatibilityResultId } from "../../value-objects/frontier-market-ids.vo.js";
import { type CompatibilityNote } from "../../value-objects/frontier-text.vo.js";
export type CompatibilityTarget = "market_draft_pipeline" | "publishing_engine" | "editorial_pipeline";
export type AdvancedMarketCompatibilityResult = Readonly<{
    id: AdvancedMarketCompatibilityResultId;
    target: CompatibilityTarget;
    status: AdvancedCompatibilityStatus;
    mapped_artifact: Readonly<Record<string, unknown>>;
    notes: readonly CompatibilityNote[];
}>;
export declare const createAdvancedMarketCompatibilityResult: (input: AdvancedMarketCompatibilityResult) => AdvancedMarketCompatibilityResult;
//# sourceMappingURL=advanced-market-compatibility-result.entity.d.ts.map