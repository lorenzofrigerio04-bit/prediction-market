import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";
export const createCurrencyKey = (value) => {
    const normalized = createNonEmpty(value, "currencyKey");
    if (normalized.length > 512) {
        throw new ValidationError("CURRENCY_KEY_EMPTY", "CurrencyKey exceeds max length", { length: normalized.length });
    }
    return normalized;
};
//# sourceMappingURL=currency-key.vo.js.map