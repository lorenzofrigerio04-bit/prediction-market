import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoverySourceDefinition } from "./discovery-source-definition.entity.js";
export type DiscoveryFetchRequest = Readonly<{
    sourceDefinition: DiscoverySourceDefinition;
    requestedAt: Timestamp;
    cursorNullable: string | null;
    /** For MANUAL kind: raw input to validate and normalize. Omitted for fetch-based connectors. */
    manualPayloadNullable?: Record<string, unknown> | null;
}>;
export declare const createDiscoveryFetchRequest: (input: DiscoveryFetchRequest) => DiscoveryFetchRequest;
//# sourceMappingURL=discovery-fetch-request.entity.d.ts.map