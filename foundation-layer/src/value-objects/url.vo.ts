import type { Branded } from "../common/types/branded.js";
import { ValidationError } from "../common/errors/validation-error.js";

export type Url = Branded<string, "Url">;

export const createUrl = (value: string): Url => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ValidationError("INVALID_URL", "URL must be absolute", { value });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ValidationError("UNSUPPORTED_URL_PROTOCOL", "Unsupported protocol", {
      protocol: parsed.protocol,
    });
  }

  return parsed.toString() as Url;
};
