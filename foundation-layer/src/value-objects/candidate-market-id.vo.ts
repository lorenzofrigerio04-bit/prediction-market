import { createPrefixedId } from "../common/utils/id.js";
import type { Branded } from "../common/types/branded.js";

export type CandidateMarketId = Branded<string, "CandidateMarketId">;

export const createCandidateMarketId = (value: string): CandidateMarketId =>
  createPrefixedId(value, "mkt_", "CandidateMarketId") as CandidateMarketId;
