import type { NormalizedDiscoveryPayload } from "./normalized-discovery-payload.entity.js";
import type { DiscoveryFetchFailure } from "./discovery-fetch-failure.entity.js";
import type { DiscoveryValidationFailure } from "./discovery-validation-failure.entity.js";
export type DiscoveryConnectorRunResultSuccess = Readonly<{
    outcome: "success";
    normalizedPayload: NormalizedDiscoveryPayload;
    itemCount: number;
}>;
export type DiscoveryConnectorRunResultPartialSuccess = Readonly<{
    outcome: "partial";
    normalizedPayload: NormalizedDiscoveryPayload;
    itemCount: number;
    itemFailures: readonly DiscoveryValidationFailure[];
}>;
export type DiscoveryConnectorRunResultFetchFailure = Readonly<{
    outcome: "fetch_failure";
    failure: DiscoveryFetchFailure;
}>;
export type DiscoveryConnectorRunResultParseFailure = Readonly<{
    outcome: "parse_failure";
    code: string;
    message: string;
    detailsNullable: Record<string, unknown> | null;
}>;
export type DiscoveryConnectorRunResultUnsupportedShape = Readonly<{
    outcome: "unsupported_shape";
    message: string;
    detailsNullable: Record<string, unknown> | null;
}>;
export type DiscoveryConnectorRunResultInvalidInput = Readonly<{
    outcome: "invalid_input";
    message: string;
    validationFailures: readonly DiscoveryValidationFailure[];
}>;
export type DiscoveryConnectorRunResult = DiscoveryConnectorRunResultSuccess | DiscoveryConnectorRunResultPartialSuccess | DiscoveryConnectorRunResultFetchFailure | DiscoveryConnectorRunResultParseFailure | DiscoveryConnectorRunResultUnsupportedShape | DiscoveryConnectorRunResultInvalidInput;
export declare const createDiscoveryConnectorRunResultSuccess: (input: DiscoveryConnectorRunResultSuccess) => DiscoveryConnectorRunResultSuccess;
export declare const createDiscoveryConnectorRunResultPartialSuccess: (input: DiscoveryConnectorRunResultPartialSuccess) => DiscoveryConnectorRunResultPartialSuccess;
export declare const createDiscoveryConnectorRunResultFetchFailure: (input: DiscoveryConnectorRunResultFetchFailure) => DiscoveryConnectorRunResultFetchFailure;
export declare const createDiscoveryConnectorRunResultParseFailure: (input: DiscoveryConnectorRunResultParseFailure) => DiscoveryConnectorRunResultParseFailure;
export declare const createDiscoveryConnectorRunResultUnsupportedShape: (input: DiscoveryConnectorRunResultUnsupportedShape) => DiscoveryConnectorRunResultUnsupportedShape;
export declare const createDiscoveryConnectorRunResultInvalidInput: (input: DiscoveryConnectorRunResultInvalidInput) => DiscoveryConnectorRunResultInvalidInput;
//# sourceMappingURL=discovery-connector-run-result.entity.d.ts.map