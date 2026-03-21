import type { DiscoverySourceId } from "./discovery-source-id.vo.js";
import type { DiscoverySourceKey } from "./discovery-source-key.vo.js";
export type NormalizedSourceReference = Readonly<{
    sourceId: DiscoverySourceId;
    locator: string;
    labelNullable: string | null;
    sourceKeyNullable: DiscoverySourceKey | null;
}>;
export declare const createNormalizedSourceReference: (input: NormalizedSourceReference) => NormalizedSourceReference;
//# sourceMappingURL=normalized-source-reference.vo.d.ts.map