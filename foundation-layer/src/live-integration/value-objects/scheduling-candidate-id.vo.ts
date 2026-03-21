import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type SchedulingCandidateId = Branded<string, "SchedulingCandidateId">;

export const createSchedulingCandidateId = (value: string): SchedulingCandidateId =>
  createPrefixedId(value, "scnd_", "SchedulingCandidateId") as SchedulingCandidateId;
