import { DiscoveryItemProcessingStatus } from "../enums/discovery-item-processing-status.enum.js";
import type { DiscoverySignalId } from "../value-objects/discovery-signal-id.vo.js";
import type { NormalizedExternalItemId } from "../value-objects/discovery-signal-evidence-ref.vo.js";
import type { DiscoveryValidationFailure } from "./discovery-validation-failure.entity.js";
export type DiscoveryItemProcessingResult = Readonly<{
    itemId: NormalizedExternalItemId;
    status: DiscoveryItemProcessingStatus;
    signalIdNullable: DiscoverySignalId | null;
    failureNullable: DiscoveryValidationFailure | null;
}>;
export declare const createDiscoveryItemProcessingResult: (input: DiscoveryItemProcessingResult) => DiscoveryItemProcessingResult;
//# sourceMappingURL=discovery-item-processing-result.entity.d.ts.map