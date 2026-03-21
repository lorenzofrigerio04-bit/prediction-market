import { createPrefixedId } from "../common/utils/id.js";
import type { Branded } from "../common/types/branded.js";

export type OutcomeId = Branded<string, "OutcomeId">;

export const createOutcomeId = (value: string): OutcomeId =>
  createPrefixedId(value, "out_", "OutcomeId") as OutcomeId;
