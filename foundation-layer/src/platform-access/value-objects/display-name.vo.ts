import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyTrimmed } from "./platform-access-shared.vo.js";

export type DisplayName = Branded<string, "DisplayName">;

export const createDisplayName = (value: string): DisplayName =>
  createNonEmptyTrimmed(value, "INVALID_DISPLAY_NAME", "display_name") as DisplayName;
