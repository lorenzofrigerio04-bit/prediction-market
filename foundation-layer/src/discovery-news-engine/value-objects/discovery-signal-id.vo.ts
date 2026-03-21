import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type DiscoverySignalId = Branded<string, "DiscoverySignalId">;

export const createDiscoverySignalId = (value: string): DiscoverySignalId =>
  createPrefixedId(value, "dsig_", "DiscoverySignalId") as DiscoverySignalId;
