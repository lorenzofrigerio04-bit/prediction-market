import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type AbuseRiskFlagId = Branded<string, "AbuseRiskFlagId">;

export const createAbuseRiskFlagId = (value: string): AbuseRiskFlagId =>
  createPrefixedId(value, "var_", "AbuseRiskFlagId");
