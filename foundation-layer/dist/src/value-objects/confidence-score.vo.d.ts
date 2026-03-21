import type { Branded } from "../common/types/branded.js";
import { ConfidenceTier } from "../enums/confidence-tier.enum.js";
export type ConfidenceScore = Branded<number, "ConfidenceScore">;
export declare const createConfidenceScore: (value: number) => ConfidenceScore;
export declare const toConfidenceTier: (score: ConfidenceScore) => ConfidenceTier;
//# sourceMappingURL=confidence-score.vo.d.ts.map