import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type SourceObservationId = Branded<string, "SourceObservationId">;

export const createSourceObservationId = (value: string): SourceObservationId =>
  createPrefixedId(value, "obs_", "SourceObservationId") as SourceObservationId;
