import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type CorrelationGroupRef = Branded<string, "CorrelationGroupRef">;

export const createCorrelationGroupRef = (value: string): CorrelationGroupRef =>
  createPrefixedId(value, "cgr_", "CorrelationGroupRef") as CorrelationGroupRef;
