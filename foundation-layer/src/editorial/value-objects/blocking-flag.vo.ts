import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { ReasonCode } from "../enums/reason-code.enum.js";

export type BlockingFlag = Readonly<{
  code: ReasonCode;
  message: string;
  path: string;
  is_resolved: boolean;
}>;

export const createBlockingFlag = (input: BlockingFlag): BlockingFlag => {
  if (input.message.trim().length === 0 || input.path.trim().length === 0) {
    throw new ValidationError("INVALID_BLOCKING_FLAG", "blocking flag requires non-empty message and path");
  }
  return deepFreeze(input);
};

export const createBlockingFlagCollection = (
  input: readonly BlockingFlag[],
  fieldName: string,
): readonly BlockingFlag[] => {
  const normalized = input.map((item) => createBlockingFlag(item));
  const dedupe = new Set<string>();
  for (const item of normalized) {
    const key = `${item.code}|${item.path}`;
    if (dedupe.has(key)) {
      throw new ValidationError("DUPLICATE_BLOCKING_FLAG", `${fieldName} contains duplicate code/path`, {
        key,
      });
    }
    dedupe.add(key);
  }
  return deepFreeze([...normalized]);
};
