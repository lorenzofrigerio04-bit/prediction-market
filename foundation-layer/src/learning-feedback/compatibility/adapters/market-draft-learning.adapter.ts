import { AggregationStatus } from "../../enums/aggregation-status.enum.js";
import { LearningCompatibilityStatus } from "../../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../../enums/learning-compatibility-target.enum.js";
import {
  createLearningCompatibilityResult,
  type LearningCompatibilityResult,
} from "../entities/learning-compatibility-result.entity.js";
import type { LearningCompatibilityAdapter } from "../interfaces/learning-compatibility-adapter.js";
import type { LearningAggregation } from "../../aggregation/entities/learning-aggregation.entity.js";
import type { LearningInsight } from "../../insights/entities/learning-insight.entity.js";
import { createLearningCompatibilityResultId } from "../../value-objects/learning-feedback-ids.vo.js";

export type MarketDraftLearningInput = Readonly<{
  aggregation: LearningAggregation;
  insight: LearningInsight;
}>;

const toStatus = (input: MarketDraftLearningInput): LearningCompatibilityStatus => {
  if (input.aggregation.aggregation_status === AggregationStatus.ARCHIVED) {
    return LearningCompatibilityStatus.INCOMPATIBLE;
  }
  if (input.aggregation.aggregation_status === AggregationStatus.DRAFT) {
    return LearningCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
  }
  return LearningCompatibilityStatus.COMPATIBLE;
};

export class MarketDraftLearningAdapter
  implements LearningCompatibilityAdapter<MarketDraftLearningInput>
{
  adapt(input: MarketDraftLearningInput): LearningCompatibilityResult {
    const status = toStatus(input);
    return createLearningCompatibilityResult({
      id: createLearningCompatibilityResultId(`lcp_${input.aggregation.id.slice(4)}md`),
      correlation_id: input.aggregation.correlation_id,
      target: LearningCompatibilityTarget.MARKET_DRAFT_LEARNING,
      status,
      mapped_artifact: {
        source_id: input.aggregation.id,
        target_id: input.insight.id,
        readiness: status,
        lossy_fields: ["signal_cluster_topology"],
      },
      notes: ["deterministic market-draft compatibility mapping"],
    });
  }
}
