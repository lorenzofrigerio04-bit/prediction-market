import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyConsoleText } from "./operations-console-shared.vo.js";

export type SortField = Branded<string, "SortField">;

export const createSortField = (value: string): SortField =>
  createNonEmptyConsoleText(value, "INVALID_SORT_FIELD", "sort_field") as SortField;
