import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import { DiscoveryContentType } from "../enums/discovery-content-type.enum.js";
export type DiscoveryTransportMetadata = Readonly<{
    contentType: DiscoveryContentType;
    fetchedAt: Timestamp;
    statusCodeNullable: number | null;
    etagNullable: string | null;
}>;
export declare const createDiscoveryTransportMetadata: (input: DiscoveryTransportMetadata) => DiscoveryTransportMetadata;
//# sourceMappingURL=discovery-transport-metadata.entity.d.ts.map