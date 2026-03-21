import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";

export type CurrencyKey = Branded<string, "CurrencyKey">;

export const createCurrencyKey = (value: string): CurrencyKey => {
  const normalized = createNonEmpty(value, "currencyKey");
  if (normalized.length > 512) {
    throw new ValidationError("CURRENCY_KEY_EMPTY", "CurrencyKey exceeds max length", { length: normalized.length });
  }
  return normalized as CurrencyKey;
};
