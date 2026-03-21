import type { Branded } from "../../common/types/branded.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";

export type SafetyCheck = Branded<string, "SafetyCheck">;

export const createSafetyCheck = (value: string): SafetyCheck =>
  assertNonEmpty(value, "safety_check") as SafetyCheck;
