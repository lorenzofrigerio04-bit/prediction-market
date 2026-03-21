import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";

export type ActionKey = Branded<string, "ActionKey">;

export const createActionKey = (value: string): ActionKey => {
  const normalized = createNonEmpty(value, "actionKey");
  if (normalized.length > 512) {
    throw new ValidationError("ACTION_KEY_EMPTY", "ActionKey exceeds max length", { length: normalized.length });
  }
  return normalized as ActionKey;
};
