import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyConsoleText } from "./operations-console-shared.vo.js";

export type WarningMessage = Branded<string, "WarningMessage">;

export const createWarningMessage = (value: string): WarningMessage =>
  createNonEmptyConsoleText(value, "INVALID_WARNING_MESSAGE", "warning_message") as WarningMessage;
