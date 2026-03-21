import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import { DiscoveryContentType } from "../enums/discovery-content-type.enum.js";

export type DiscoveryTransportMetadata = Readonly<{
  contentType: DiscoveryContentType;
  fetchedAt: Timestamp;
  statusCodeNullable: number | null;
  etagNullable: string | null;
}>;

export const createDiscoveryTransportMetadata = (
  input: DiscoveryTransportMetadata,
): DiscoveryTransportMetadata =>
  deepFreeze({
    ...input,
    statusCodeNullable: input.statusCodeNullable ?? null,
    etagNullable: input.etagNullable ?? null,
  });
