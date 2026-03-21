import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyConsoleText } from "./operations-console-shared.vo.js";

export type DisplayLabel = Branded<string, "DisplayLabel">;

export const createDisplayLabel = (value: string): DisplayLabel =>
  createNonEmptyConsoleText(value, "INVALID_DISPLAY_LABEL", "display_label") as DisplayLabel;
