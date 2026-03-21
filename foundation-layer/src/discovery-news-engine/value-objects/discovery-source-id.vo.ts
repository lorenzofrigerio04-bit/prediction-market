import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type DiscoverySourceId = Branded<string, "DiscoverySourceId">;

export const createDiscoverySourceId = (value: string): DiscoverySourceId =>
  createPrefixedId(value, "dsrc_", "DiscoverySourceId") as DiscoverySourceId;
