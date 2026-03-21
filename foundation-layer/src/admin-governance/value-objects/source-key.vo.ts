import type { Branded } from "../../common/types/branded.js";
import { createNonEmpty } from "./shared.vo.js";

export type SourceKey = Branded<string, "SourceKey">;

export const createSourceKey = (value: string): SourceKey =>
  createNonEmpty(value, "source_key") as SourceKey;
