import { AggregationStatus } from "../../enums/aggregation-status.enum.js";
import { LearningCompatibilityStatus } from "../../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../../enums/learning-compatibility-target.enum.js";
import { createLearningCompatibilityResult, } from "../entities/learning-compatibility-result.entity.js";
import { createLearningCompatibilityResultId } from "../../value-objects/learning-feedback-ids.vo.js";
const toStatus = (input) => {
    if (input.aggregation.aggregation_status === AggregationStatus.ARCHIVED) {
        return LearningCompatibilityStatus.INCOMPATIBLE;
    }
    if (input.aggregation.aggregation_status === AggregationStatus.DRAFT) {
        return LearningCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
    }
    return LearningCompatibilityStatus.COMPATIBLE;
};
export class MarketDraftLearningAdapter {
    adapt(input) {
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
//# sourceMappingURL=market-draft-learning.adapter.js.map