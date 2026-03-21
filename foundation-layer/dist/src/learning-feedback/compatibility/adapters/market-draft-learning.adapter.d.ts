import { type LearningCompatibilityResult } from "../entities/learning-compatibility-result.entity.js";
import type { LearningCompatibilityAdapter } from "../interfaces/learning-compatibility-adapter.js";
import type { LearningAggregation } from "../../aggregation/entities/learning-aggregation.entity.js";
import type { LearningInsight } from "../../insights/entities/learning-insight.entity.js";
export type MarketDraftLearningInput = Readonly<{
    aggregation: LearningAggregation;
    insight: LearningInsight;
}>;
export declare class MarketDraftLearningAdapter implements LearningCompatibilityAdapter<MarketDraftLearningInput> {
    adapt(input: MarketDraftLearningInput): LearningCompatibilityResult;
}
//# sourceMappingURL=market-draft-learning.adapter.d.ts.map