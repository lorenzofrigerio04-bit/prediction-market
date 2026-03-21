import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { DiscoveryTransportMetadata } from "./discovery-transport-metadata.entity.js";

export type DiscoveryFetchedPayload = Readonly<{
  raw: Record<string, unknown>;
  transportMetadata: DiscoveryTransportMetadata;
}>;

export const createDiscoveryFetchedPayload = (
  input: DiscoveryFetchedPayload,
): DiscoveryFetchedPayload => deepFreeze({
  raw: { ...input.raw },
  transportMetadata: input.transportMetadata,
});
