import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type ActionItem = Branded<string, "ActionItem">;

export const createActionItem = (value: string): ActionItem => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_ACTION_ITEM", "action_item must not be empty", { value });
  }
  return normalized as ActionItem;
};
