import { createPrefixedId } from "../common/utils/id.js";
import type { Branded } from "../common/types/branded.js";

export type SourceId = Branded<string, "SourceId">;

export const createSourceId = (value: string): SourceId =>
  createPrefixedId(value, "src_", "SourceId") as SourceId;
