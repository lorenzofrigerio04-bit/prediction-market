import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type InvariantCheck = Readonly<{
  code: string;
  passed: boolean;
  message: string;
}>;

export const createInvariantCheck = (input: InvariantCheck): InvariantCheck => {
  if (input.code.trim().length === 0) {
    throw new ValidationError("INVALID_INVARIANT_CHECK", "code must be non-empty");
  }
  if (input.message.trim().length === 0) {
    throw new ValidationError("INVALID_INVARIANT_CHECK", "message must be non-empty");
  }
  return deepFreeze({
    ...input,
    code: input.code.trim(),
    message: input.message.trim(),
  });
};
