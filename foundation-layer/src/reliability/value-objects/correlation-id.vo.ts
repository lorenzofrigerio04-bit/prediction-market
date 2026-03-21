import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type CorrelationId = Branded<string, "CorrelationId">;

export const createCorrelationId = (value: string): CorrelationId =>
  createPrefixedId(value, "corr_", "CorrelationId") as CorrelationId;
