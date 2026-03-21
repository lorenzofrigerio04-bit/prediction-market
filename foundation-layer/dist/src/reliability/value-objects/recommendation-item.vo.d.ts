import type { Branded } from "../../common/types/branded.js";
export type RecommendationItem = Branded<string, "RecommendationItem">;
export declare const createRecommendationItem: (value: string) => RecommendationItem;
export declare const createRecommendationItemCollection: (input: readonly string[]) => readonly RecommendationItem[];
//# sourceMappingURL=recommendation-item.vo.d.ts.map