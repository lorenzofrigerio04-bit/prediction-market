import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type WarningMessage = Readonly<{
  code: string;
  message: string;
  path: string;
}>;

export const createWarningMessage = (input: WarningMessage): WarningMessage => {
  if (input.code.trim().length === 0 || input.message.trim().length === 0 || input.path.trim().length === 0) {
    throw new ValidationError(
      "INVALID_WARNING_MESSAGE",
      "WarningMessage requires non-empty code, message and path",
    );
  }
  return deepFreeze(input);
};

export const createWarningMessageCollection = (
  input: readonly WarningMessage[],
): readonly WarningMessage[] => deepFreeze(input.map((item) => createWarningMessage(item)));
