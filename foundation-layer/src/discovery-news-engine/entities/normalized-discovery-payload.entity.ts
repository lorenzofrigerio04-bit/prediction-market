import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { DiscoverySourceId } from "../value-objects/discovery-source-id.vo.js";
import type { DiscoveryProvenanceMetadata } from "./discovery-provenance-metadata.entity.js";
import type { NormalizedDiscoveryItem } from "./normalized-discovery-item.entity.js";

export type NormalizedDiscoveryPayload = Readonly<{
  items: readonly NormalizedDiscoveryItem[];
  provenanceMetadata: DiscoveryProvenanceMetadata;
  sourceId: DiscoverySourceId;
}>;

export const createNormalizedDiscoveryPayload = (
  input: NormalizedDiscoveryPayload,
): NormalizedDiscoveryPayload => {
  if (input.items.length === 0) {
    throw new ValidationError(
      "INVALID_NORMALIZED_DISCOVERY_PAYLOAD",
      "items must contain at least one item",
    );
  }
  return deepFreeze({
    items: [...input.items],
    provenanceMetadata: input.provenanceMetadata,
    sourceId: input.sourceId,
  });
};
