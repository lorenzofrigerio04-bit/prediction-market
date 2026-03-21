import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type DiscoveryStoryClusterId = Branded<string, "DiscoveryStoryClusterId">;

export const createDiscoveryStoryClusterId = (value: string): DiscoveryStoryClusterId =>
  createPrefixedId(value, "dsc_", "DiscoveryStoryClusterId") as DiscoveryStoryClusterId;
