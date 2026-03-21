import type { Branded } from "../../common/types/branded.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";

export type WarningMessage = Branded<string, "WarningMessage">;

export const createWarningMessage = (value: string): WarningMessage =>
  assertNonEmpty(value, "warning_message") as WarningMessage;
