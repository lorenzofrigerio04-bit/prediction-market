import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createScore01 } from "../../value-objects/score.vo.js";
export const createPreliminaryScorecard = (input) => {
    createScore01(input.clarity_score, "clarity_score");
    createScore01(input.resolvability_score, "resolvability_score");
    createScore01(input.novelty_score, "novelty_score");
    createScore01(input.liquidity_potential_score, "liquidity_potential_score");
    createScore01(input.ambiguity_risk_score, "ambiguity_risk_score");
    createScore01(input.duplicate_risk_score, "duplicate_risk_score");
    createScore01(input.editorial_value_score, "editorial_value_score");
    createScore01(input.final_publish_score, "final_publish_score");
    return deepFreeze(input);
};
//# sourceMappingURL=preliminary-scorecard.entity.js.map