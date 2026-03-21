import { ValidationError } from "../../common/errors/validation-error.js";
export const createRecommendationItem = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_RECOMMENDATION_ITEM", "recommendation_item must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=recommendation-item.vo.js.map