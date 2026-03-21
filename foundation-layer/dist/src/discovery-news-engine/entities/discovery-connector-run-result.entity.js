import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryConnectorRunResultSuccess = (input) => deepFreeze({
    outcome: "success",
    normalizedPayload: input.normalizedPayload,
    itemCount: input.itemCount,
});
export const createDiscoveryConnectorRunResultPartialSuccess = (input) => deepFreeze({
    outcome: "partial",
    normalizedPayload: input.normalizedPayload,
    itemCount: input.itemCount,
    itemFailures: [...input.itemFailures],
});
export const createDiscoveryConnectorRunResultFetchFailure = (input) => deepFreeze({
    outcome: "fetch_failure",
    failure: input.failure,
});
export const createDiscoveryConnectorRunResultParseFailure = (input) => deepFreeze({
    outcome: "parse_failure",
    code: input.code,
    message: input.message,
    detailsNullable: input.detailsNullable ?? null,
});
export const createDiscoveryConnectorRunResultUnsupportedShape = (input) => deepFreeze({
    outcome: "unsupported_shape",
    message: input.message,
    detailsNullable: input.detailsNullable ?? null,
});
export const createDiscoveryConnectorRunResultInvalidInput = (input) => deepFreeze({
    outcome: "invalid_input",
    message: input.message,
    validationFailures: [...input.validationFailures],
});
//# sourceMappingURL=discovery-connector-run-result.entity.js.map