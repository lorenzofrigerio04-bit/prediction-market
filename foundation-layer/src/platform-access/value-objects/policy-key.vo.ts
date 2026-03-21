import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyTrimmed } from "./platform-access-shared.vo.js";

export type PolicyKey = Branded<string, "PolicyKey">;

export const createPolicyKey = (value: string): PolicyKey =>
  createNonEmptyTrimmed(value, "INVALID_POLICY_KEY", "policy_key") as PolicyKey;
