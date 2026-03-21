import { createDiscoveryConnectorRunResultSuccess, createDiscoveryConnectorRunResultPartialSuccess, createDiscoveryConnectorRunResultFetchFailure, createDiscoveryConnectorRunResultParseFailure, createDiscoveryConnectorRunResultUnsupportedShape, createDiscoveryConnectorRunResultInvalidInput, } from "../entities/discovery-connector-run-result.entity.js";
export function connectorSuccess(normalizedPayload) {
    return createDiscoveryConnectorRunResultSuccess({
        outcome: "success",
        normalizedPayload,
        itemCount: normalizedPayload.items.length,
    });
}
export function connectorPartialSuccess(normalizedPayload, itemFailures) {
    return createDiscoveryConnectorRunResultPartialSuccess({
        outcome: "partial",
        normalizedPayload,
        itemCount: normalizedPayload.items.length,
        itemFailures,
    });
}
export function connectorFetchFailure(failure) {
    return createDiscoveryConnectorRunResultFetchFailure({
        outcome: "fetch_failure",
        failure,
    });
}
export function connectorParseFailure(code, message, detailsNullable = null) {
    return createDiscoveryConnectorRunResultParseFailure({
        outcome: "parse_failure",
        code,
        message,
        detailsNullable,
    });
}
export function connectorUnsupportedShape(message, detailsNullable = null) {
    return createDiscoveryConnectorRunResultUnsupportedShape({
        outcome: "unsupported_shape",
        message,
        detailsNullable,
    });
}
export function connectorInvalidInput(message, validationFailures) {
    return createDiscoveryConnectorRunResultInvalidInput({
        outcome: "invalid_input",
        message,
        validationFailures,
    });
}
//# sourceMappingURL=connector-result-helpers.js.map