import { describe, expect, it } from "vitest";
import {
  createDiscoveryConnectorRunResultSuccess,
  createDiscoveryConnectorRunResultPartialSuccess,
  createDiscoveryConnectorRunResultFetchFailure,
  createDiscoveryConnectorRunResultParseFailure,
  createDiscoveryConnectorRunResultUnsupportedShape,
  createDiscoveryConnectorRunResultInvalidInput,
  createDiscoveryFetchFailure,
  createDiscoveryValidationFailure,
  createNormalizedDiscoveryPayload,
  createNormalizedDiscoveryItem,
  createNormalizedSourceReference,
  createDiscoveryProvenanceMetadata,
  createDiscoverySourceId,
  createDiscoverySourceKey,
  DiscoverySourceTier,
  DiscoveryTrustTier,
} from "../../src/discovery-news-engine/index.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";

describe("DiscoveryConnectorRunResult", () => {
  const sourceId = createDiscoverySourceId("dsrc_test001");
  const sourceKey = createDiscoverySourceKey("test-source");
  const item = createNormalizedDiscoveryItem({
    headline: "Test",
    bodySnippetNullable: null,
    canonicalUrl: "https://example.com/1",
    externalItemId: "ext-1",
    publishedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
    publishedAtPresent: true,
    sourceReference: createNormalizedSourceReference({
      sourceId,
      locator: "https://example.com/1",
      labelNullable: null,
      sourceKeyNullable: sourceKey,
    }),
    geoSignalNullable: null,
    geoPlaceTextNullable: null,
    topicSignalNullable: null,
    languageCode: "it",
    observedMetricsNullable: null,
  });
  const normalizedPayload = createNormalizedDiscoveryPayload({
    items: [item],
    provenanceMetadata: createDiscoveryProvenanceMetadata({
      fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
      sourceDefinitionId: sourceId,
      runIdNullable: null,
      sourceKey,
      sourceRoleNullable: null,
      sourceTier: DiscoverySourceTier.PRIMARY,
      trustTier: DiscoveryTrustTier.CURATED,
      endpointReferenceNullable: null,
      adapterKeyNullable: null,
      fetchMetadataNullable: null,
    }),
    sourceId,
  });

  it("success variant has outcome and normalizedPayload and itemCount", () => {
    const r = createDiscoveryConnectorRunResultSuccess({
      outcome: "success",
      normalizedPayload,
      itemCount: 1,
    });
    expect(r.outcome).toBe("success");
    expect(r.normalizedPayload.items).toHaveLength(1);
    expect(r.itemCount).toBe(1);
  });

  it("partialSuccess variant has itemFailures", () => {
    const failure = createDiscoveryValidationFailure({
      code: "MISSING_FIELD",
      path: "/items/1",
      message: "Missing headline",
      contextNullable: null,
    });
    const r = createDiscoveryConnectorRunResultPartialSuccess({
      outcome: "partial",
      normalizedPayload,
      itemCount: 1,
      itemFailures: [failure],
    });
    expect(r.outcome).toBe("partial");
    expect(r.itemFailures).toHaveLength(1);
    expect(r.itemFailures[0]!.code).toBe("MISSING_FIELD");
  });

  it("fetchFailure variant has failure", () => {
    const failure = createDiscoveryFetchFailure({
      code: "HTTP_ERROR",
      message: "HTTP 500",
      retryable: true,
      detailsNullable: null,
    });
    const r = createDiscoveryConnectorRunResultFetchFailure({
      outcome: "fetch_failure",
      failure,
    });
    expect(r.outcome).toBe("fetch_failure");
    expect(r.failure.code).toBe("HTTP_ERROR");
  });

  it("parseFailure variant has code, message, detailsNullable", () => {
    const r = createDiscoveryConnectorRunResultParseFailure({
      outcome: "parse_failure",
      code: "PARSE_FAILURE",
      message: "Invalid XML",
      detailsNullable: { line: 10 },
    });
    expect(r.outcome).toBe("parse_failure");
    expect(r.code).toBe("PARSE_FAILURE");
    expect(r.detailsNullable).toEqual({ line: 10 });
  });

  it("unsupportedShape variant has message", () => {
    const r = createDiscoveryConnectorRunResultUnsupportedShape({
      outcome: "unsupported_shape",
      message: "No items array",
      detailsNullable: null,
    });
    expect(r.outcome).toBe("unsupported_shape");
    expect(r.message).toBe("No items array");
  });

  it("invalidInput variant has validationFailures", () => {
    const failures = [
      createDiscoveryValidationFailure({
        code: "INVALID_SHAPE",
        path: "",
        message: "Required items",
        contextNullable: null,
      }),
    ];
    const r = createDiscoveryConnectorRunResultInvalidInput({
      outcome: "invalid_input",
      message: "Validation failed",
      validationFailures: failures,
    });
    expect(r.outcome).toBe("invalid_input");
    expect(r.validationFailures).toHaveLength(1);
    expect(r.validationFailures[0]!.code).toBe("INVALID_SHAPE");
  });
});
