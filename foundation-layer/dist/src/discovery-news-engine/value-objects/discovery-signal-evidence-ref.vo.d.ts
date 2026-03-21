import { DiscoveryEvidenceRole } from "../enums/discovery-evidence-role.enum.js";
export type NormalizedExternalItemId = string;
export type DiscoverySignalEvidenceRef = Readonly<{
    itemId: NormalizedExternalItemId;
    role: DiscoveryEvidenceRole;
}>;
export declare const createDiscoverySignalEvidenceRef: (input: DiscoverySignalEvidenceRef) => DiscoverySignalEvidenceRef;
//# sourceMappingURL=discovery-signal-evidence-ref.vo.d.ts.map