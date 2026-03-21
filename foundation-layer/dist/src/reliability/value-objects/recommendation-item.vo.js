import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createRecommendationItem = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_RECOMMENDATION_ITEM", "RecommendationItem must not be empty");
    }
    return normalized;
};
export const createRecommendationItemCollection = (input) => deepFreeze(input.map((item) => createRecommendationItem(item)));
//# sourceMappingURL=recommendation-item.vo.js.map