import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type Version = Branded<string, "Version">;

export const createVersion = (value: string): Version => {
  if (!/^v\d+\.\d+\.\d+$/.test(value)) {
    throw new ValidationError("INVALID_VERSION", "version must match v<major>.<minor>.<patch>", { value });
  }
  return value as Version;
};
