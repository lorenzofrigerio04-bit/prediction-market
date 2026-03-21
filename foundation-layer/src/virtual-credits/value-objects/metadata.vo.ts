import type { Branded } from "../../common/types/branded.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type Metadata = Branded<Readonly<Record<string, string>>, "Metadata">;

export const createMetadata = (value?: Readonly<Record<string, string>>): Metadata => {
  const normalized: Record<string, string> = {};
  for (const [key, item] of Object.entries(value ?? {})) {
    if (key.trim().length === 0) {
      continue;
    }
    normalized[key] = String(item);
  }
  return deepFreeze(normalized) as Metadata;
};
