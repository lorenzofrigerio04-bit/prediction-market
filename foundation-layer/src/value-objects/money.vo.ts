import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";

export type Money = Readonly<{
  currency: string;
  amount: string;
}>;

const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const DECIMAL_PATTERN = /^-?\d+(?:\.\d{1,8})?$/;

export const createMoney = (currency: string, amount: string | number): Money => {
  const normalizedCurrency = currency.trim().toUpperCase();
  const amountAsString = String(amount).trim();

  if (!CURRENCY_PATTERN.test(normalizedCurrency)) {
    throw new ValidationError("INVALID_CURRENCY", "Currency must be ISO-4217-like", {
      currency,
    });
  }

  if (!DECIMAL_PATTERN.test(amountAsString)) {
    throw new ValidationError("INVALID_MONEY_AMOUNT", "Amount must be decimal-safe", {
      amount,
    });
  }

  return deepFreeze({
    currency: normalizedCurrency,
    amount: amountAsString,
  });
};
