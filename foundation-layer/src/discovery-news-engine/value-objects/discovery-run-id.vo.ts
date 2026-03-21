import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type DiscoveryRunId = Branded<string, "DiscoveryRunId">;

export const createDiscoveryRunId = (value: string): DiscoveryRunId =>
  createPrefixedId(value, "drun_", "DiscoveryRunId") as DiscoveryRunId;
