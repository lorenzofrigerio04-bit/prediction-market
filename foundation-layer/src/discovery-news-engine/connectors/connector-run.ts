import type { DiscoverySourceConnector } from "../interfaces/discovery-source-connector.js";
import type { DiscoveryNormalizationAdapter } from "../interfaces/discovery-normalization-adapter.js";
import type { DiscoveryFetchRequest } from "../entities/discovery-fetch-request.entity.js";
import type { DiscoveryConnectorRunResult } from "../entities/discovery-connector-run-result.entity.js";
import type { DiscoveryValidationFailure } from "../entities/discovery-validation-failure.entity.js";
import {
  connectorSuccess,
  connectorFetchFailure,
  connectorParseFailure,
  connectorUnsupportedShape,
  connectorInvalidInput,
} from "./connector-result-helpers.js";

/**
 * Runs connector fetch then normalizer; returns DiscoveryConnectorRunResult.
 * Handles fetch failure, invalid input (manual), parse/normalization errors, and empty payload (unsupported_shape).
 */
export async function runConnectorWithNormalize(
  request: DiscoveryFetchRequest,
  connector: DiscoverySourceConnector,
  normalizer: DiscoveryNormalizationAdapter,
): Promise<DiscoveryConnectorRunResult> {
  const response = await connector.fetch(request);
  if (!response.ok) {
    const failure = response.failure;
    if (failure.code === "INVALID_INPUT") {
      const validationFailures = (failure.detailsNullable as { validationFailures?: DiscoveryValidationFailure[] } | null)
        ?.validationFailures;
      if (Array.isArray(validationFailures) && validationFailures.length > 0) {
        return connectorInvalidInput(failure.message, validationFailures);
      }
    }
    return connectorFetchFailure(failure);
  }

  try {
    const normalizedPayload = normalizer.normalize(response.payload, {
      sourceDefinition: request.sourceDefinition,
      runIdNullable: null,
    });
    if (normalizedPayload.items.length === 0) {
      return connectorUnsupportedShape("No items to normalize", {
        sourceKey: String(request.sourceDefinition.key),
      });
    }
    return connectorSuccess(normalizedPayload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("No items to normalize") || message.includes("items must contain")) {
      return connectorUnsupportedShape(message, {
        sourceKey: String(request.sourceDefinition.key),
      });
    }
    return connectorParseFailure("NORMALIZATION_FAILED", message, {
      name: err instanceof Error ? err.name : undefined,
    });
  }
}
