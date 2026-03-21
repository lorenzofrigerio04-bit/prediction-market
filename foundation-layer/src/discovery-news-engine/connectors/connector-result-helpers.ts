import type { NormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";
import type { DiscoveryFetchFailure } from "../entities/discovery-fetch-failure.entity.js";
import type { DiscoveryValidationFailure } from "../entities/discovery-validation-failure.entity.js";
import type {
  DiscoveryConnectorRunResultSuccess,
  DiscoveryConnectorRunResultPartialSuccess,
  DiscoveryConnectorRunResultFetchFailure,
  DiscoveryConnectorRunResultParseFailure,
  DiscoveryConnectorRunResultUnsupportedShape,
  DiscoveryConnectorRunResultInvalidInput,
} from "../entities/discovery-connector-run-result.entity.js";
import {
  createDiscoveryConnectorRunResultSuccess,
  createDiscoveryConnectorRunResultPartialSuccess,
  createDiscoveryConnectorRunResultFetchFailure,
  createDiscoveryConnectorRunResultParseFailure,
  createDiscoveryConnectorRunResultUnsupportedShape,
  createDiscoveryConnectorRunResultInvalidInput,
} from "../entities/discovery-connector-run-result.entity.js";

export function connectorSuccess(
  normalizedPayload: NormalizedDiscoveryPayload,
): DiscoveryConnectorRunResultSuccess {
  return createDiscoveryConnectorRunResultSuccess({
    outcome: "success",
    normalizedPayload,
    itemCount: normalizedPayload.items.length,
  });
}

export function connectorPartialSuccess(
  normalizedPayload: NormalizedDiscoveryPayload,
  itemFailures: readonly DiscoveryValidationFailure[],
): DiscoveryConnectorRunResultPartialSuccess {
  return createDiscoveryConnectorRunResultPartialSuccess({
    outcome: "partial",
    normalizedPayload,
    itemCount: normalizedPayload.items.length,
    itemFailures,
  });
}

export function connectorFetchFailure(
  failure: DiscoveryFetchFailure,
): DiscoveryConnectorRunResultFetchFailure {
  return createDiscoveryConnectorRunResultFetchFailure({
    outcome: "fetch_failure",
    failure,
  });
}

export function connectorParseFailure(
  code: string,
  message: string,
  detailsNullable: Record<string, unknown> | null = null,
): DiscoveryConnectorRunResultParseFailure {
  return createDiscoveryConnectorRunResultParseFailure({
    outcome: "parse_failure",
    code,
    message,
    detailsNullable,
  });
}

export function connectorUnsupportedShape(
  message: string,
  detailsNullable: Record<string, unknown> | null = null,
): DiscoveryConnectorRunResultUnsupportedShape {
  return createDiscoveryConnectorRunResultUnsupportedShape({
    outcome: "unsupported_shape",
    message,
    detailsNullable,
  });
}

export function connectorInvalidInput(
  message: string,
  validationFailures: readonly DiscoveryValidationFailure[],
): DiscoveryConnectorRunResultInvalidInput {
  return createDiscoveryConnectorRunResultInvalidInput({
    outcome: "invalid_input",
    message,
    validationFailures,
  });
}
