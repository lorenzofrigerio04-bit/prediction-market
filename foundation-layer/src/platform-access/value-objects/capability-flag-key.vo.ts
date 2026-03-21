import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyTrimmed } from "./platform-access-shared.vo.js";

export type CapabilityFlagKey = Branded<string, "CapabilityFlagKey">;

export const createCapabilityFlagKey = (value: string): CapabilityFlagKey =>
  createNonEmptyTrimmed(value, "INVALID_CAPABILITY_FLAG_KEY", "capability_flag_key") as CapabilityFlagKey;
