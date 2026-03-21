import { deepFreeze } from "../../common/utils/deep-freeze.js";
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

export type DiscoveryConnectorRunResult =
  | DiscoveryConnectorRunResultSuccess
  | DiscoveryConnectorRunResultPartialSuccess
  | DiscoveryConnectorRunResultFetchFailure
  | DiscoveryConnectorRunResultParseFailure
  | DiscoveryConnectorRunResultUnsupportedShape
  | DiscoveryConnectorRunResultInvalidInput;

export const createDiscoveryConnectorRunResultSuccess = (
  input: DiscoveryConnectorRunResultSuccess,
): DiscoveryConnectorRunResultSuccess =>
  deepFreeze({
    outcome: "success",
    normalizedPayload: input.normalizedPayload,
    itemCount: input.itemCount,
  });

export const createDiscoveryConnectorRunResultPartialSuccess = (
  input: DiscoveryConnectorRunResultPartialSuccess,
): DiscoveryConnectorRunResultPartialSuccess =>
  deepFreeze({
    outcome: "partial",
    normalizedPayload: input.normalizedPayload,
    itemCount: input.itemCount,
    itemFailures: [...input.itemFailures],
  });

export const createDiscoveryConnectorRunResultFetchFailure = (
  input: DiscoveryConnectorRunResultFetchFailure,
): DiscoveryConnectorRunResultFetchFailure =>
  deepFreeze({
    outcome: "fetch_failure",
    failure: input.failure,
  });

export const createDiscoveryConnectorRunResultParseFailure = (
  input: DiscoveryConnectorRunResultParseFailure,
): DiscoveryConnectorRunResultParseFailure =>
  deepFreeze({
    outcome: "parse_failure",
    code: input.code,
    message: input.message,
    detailsNullable: input.detailsNullable ?? null,
  });

export const createDiscoveryConnectorRunResultUnsupportedShape = (
  input: DiscoveryConnectorRunResultUnsupportedShape,
): DiscoveryConnectorRunResultUnsupportedShape =>
  deepFreeze({
    outcome: "unsupported_shape",
    message: input.message,
    detailsNullable: input.detailsNullable ?? null,
  });

export const createDiscoveryConnectorRunResultInvalidInput = (
  input: DiscoveryConnectorRunResultInvalidInput,
): DiscoveryConnectorRunResultInvalidInput =>
  deepFreeze({
    outcome: "invalid_input",
    message: input.message,
    validationFailures: [...input.validationFailures],
  });
