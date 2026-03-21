import type { NormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import type { DiscoveryFetchFailure } from "../entities/discovery-fetch-failure.entity.js";
import type { DiscoveryValidationFailure } from "../entities/discovery-validation-failure.entity.js";
import type { DiscoveryConnectorRunResultSuccess, DiscoveryConnectorRunResultPartialSuccess, DiscoveryConnectorRunResultFetchFailure, DiscoveryConnectorRunResultParseFailure, DiscoveryConnectorRunResultUnsupportedShape, DiscoveryConnectorRunResultInvalidInput } from "../entities/discovery-connector-run-result.entity.js";
export declare function connectorSuccess(normalizedPayload: NormalizedDiscoveryPayload): DiscoveryConnectorRunResultSuccess;
export declare function connectorPartialSuccess(normalizedPayload: NormalizedDiscoveryPayload, itemFailures: readonly DiscoveryValidationFailure[]): DiscoveryConnectorRunResultPartialSuccess;
export declare function connectorFetchFailure(failure: DiscoveryFetchFailure): DiscoveryConnectorRunResultFetchFailure;
export declare function connectorParseFailure(code: string, message: string, detailsNullable?: Record<string, unknown> | null): DiscoveryConnectorRunResultParseFailure;
export declare function connectorUnsupportedShape(message: string, detailsNullable?: Record<string, unknown> | null): DiscoveryConnectorRunResultUnsupportedShape;
export declare function connectorInvalidInput(message: string, validationFailures: readonly DiscoveryValidationFailure[]): DiscoveryConnectorRunResultInvalidInput;
//# sourceMappingURL=connector-result-helpers.d.ts.map