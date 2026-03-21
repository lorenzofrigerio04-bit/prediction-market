import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type DiscoveryJobId = Branded<string, "DiscoveryJobId">;

export const createDiscoveryJobId = (value: string): DiscoveryJobId =>
  createPrefixedId(value, "djob_", "DiscoveryJobId") as DiscoveryJobId;
