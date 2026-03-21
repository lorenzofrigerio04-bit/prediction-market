import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { TargetModule } from "../enums/target-module.enum.js";

export type BlockingReason = Readonly<{
  code: string;
  message: string;
  module_name: TargetModule;
  path: string;
}>;

export const createBlockingReason = (input: BlockingReason): BlockingReason => {
  if (input.code.trim().length === 0 || input.message.trim().length === 0 || input.path.trim().length === 0) {
    throw new ValidationError(
      "INVALID_BLOCKING_REASON",
      "BlockingReason requires non-empty code, message and path",
    );
  }
  return deepFreeze(input);
};

export const createBlockingReasonCollection = (
  input: readonly BlockingReason[],
): readonly BlockingReason[] => deepFreeze(input.map((item) => createBlockingReason(item)));
