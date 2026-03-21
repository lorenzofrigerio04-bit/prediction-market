import { createPrefixedId } from "../common/utils/id.js";
import type { Branded } from "../common/types/branded.js";

export type ClaimId = Branded<string, "ClaimId">;

export const createClaimId = (value: string): ClaimId =>
  createPrefixedId(value, "clm_", "ClaimId") as ClaimId;
