import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createScore01 } from "../../value-objects/score.vo.js";

export type PreliminaryScorecard = Readonly<{
  clarity_score: number;
  resolvability_score: number;
  novelty_score: number;
  liquidity_potential_score: number;
  ambiguity_risk_score: number;
  duplicate_risk_score: number;
  editorial_value_score: number;
  final_publish_score: number;
}>;

export const createPreliminaryScorecard = (input: PreliminaryScorecard): PreliminaryScorecard => {
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
