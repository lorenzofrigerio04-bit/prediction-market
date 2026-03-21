import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { ReasonCode } from "../enums/reason-code.enum.js";

export type RequiredAction = Readonly<{
  code: ReasonCode;
  description: string;
  owner: string;
  is_mandatory: boolean;
}>;

export const createRequiredAction = (input: RequiredAction): RequiredAction => {
  if (input.description.trim().length === 0 || input.owner.trim().length === 0) {
    throw new ValidationError(
      "INVALID_REQUIRED_ACTION",
      "required action needs non-empty description and owner",
    );
  }
  return deepFreeze(input);
};

export const createRequiredActionCollection = (
  input: readonly RequiredAction[],
): readonly RequiredAction[] => deepFreeze(input.map((item) => createRequiredAction(item)));
