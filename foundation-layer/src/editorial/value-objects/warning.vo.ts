import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { ReasonCode } from "../enums/reason-code.enum.js";

export type WarningEntry = Readonly<{
  code: ReasonCode;
  message: string;
  path: string;
}>;

export const createWarningEntry = (input: WarningEntry): WarningEntry => {
  if (input.message.trim().length === 0 || input.path.trim().length === 0) {
    throw new ValidationError("INVALID_WARNING", "warning requires non-empty message and path");
  }
  return deepFreeze(input);
};

export const createWarningCollection = (input: readonly WarningEntry[]): readonly WarningEntry[] => {
  const normalized = input.map((item) => createWarningEntry(item));
  return deepFreeze([...normalized]);
};
