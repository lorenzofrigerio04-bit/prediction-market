import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type VersionTag = Branded<string, "VersionTag">;

const VERSION_PATTERN = /^v\d+\.\d+\.\d+$/;

export const createVersionTag = (value: string): VersionTag => {
  if (!VERSION_PATTERN.test(value)) {
    throw new ValidationError("INVALID_VERSION_TAG", "version_tag must follow vX.Y.Z", { value });
  }
  return value as VersionTag;
};
