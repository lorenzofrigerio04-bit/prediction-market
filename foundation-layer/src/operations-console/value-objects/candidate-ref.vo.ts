import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type CandidateRef = Branded<string, "CandidateRef">;

export const createCandidateRef = (value: string): CandidateRef =>
  createPrefixedId(value, "cdr_", "CandidateRef") as CandidateRef;
