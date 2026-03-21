import { describe, expect, it } from "vitest";
import {
  manualInputBridgeConnector,
  runConnectorWithNormalize,
  jsonApiNormalizationAdapter,
  createDiscoveryFetchRequest,
  createDiscoverySourceDefinition,
  createDiscoverySourceId,
  createDiscoverySourceKey,
  createDiscoverySourceEndpoint,
  DiscoverySourceKind,
  DiscoverySourceTier,
  DiscoverySourceStatus,
  DiscoveryPollingHint,
  DiscoveryGeoScope,
  DiscoveryTopicScope,
  DiscoveryTrustTier,
  DiscoverySourceAuthMode,
} from "../../src/discovery-news-engine/index.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";

const manualSourceDefinition = createDiscoverySourceDefinition({
  id: createDiscoverySourceId("dsrc_manual001"),
  key: createDiscoverySourceKey("manual-test"),
  kind: DiscoverySourceKind.MANUAL,
  tier: DiscoverySourceTier.PRIMARY,
  status: DiscoverySourceStatus.ENABLED,
  pollingHint: DiscoveryPollingHint.ON_DEMAND,
  geoScope: DiscoveryGeoScope.IT,
  topicScope: DiscoveryTopicScope.GENERAL,
  trustTier: DiscoveryTrustTier.CURATED,
  endpoint: createDiscoverySourceEndpoint({
    url: "https://manual/local",
    method: "POST",
    headersNullable: null,
  }),
  authMode: DiscoverySourceAuthMode.NONE,
  sourceDefinitionIdNullable: null,
});

describe("manualInputBridgeConnector", () => {
  it("canHandle returns true for MANUAL kind", () => {
    expect(manualInputBridgeConnector.canHandle(manualSourceDefinition)).toBe(true);
  });

  it("canHandle returns false for RSS kind", () => {
    const rssDef = createDiscoverySourceDefinition({
      ...manualSourceDefinition,
      kind: DiscoverySourceKind.RSS,
      key: createDiscoverySourceKey("rss-test"),
    });
    expect(manualInputBridgeConnector.canHandle(rssDef)).toBe(false);
  });

  it("fetch returns invalid input when manualPayloadNullable is missing", async () => {
    const request = createDiscoveryFetchRequest({
      sourceDefinition: manualSourceDefinition,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const response = await manualInputBridgeConnector.fetch(request);
    expect(response.ok).toBe(false);
    if (!response.ok) {
      expect(response.failure.code).toBe("INVALID_INPUT");
    }
  });

  it("fetch returns success and runConnectorWithNormalize returns success for valid items array", async () => {
    const request = createDiscoveryFetchRequest({
      sourceDefinition: manualSourceDefinition,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
      manualPayloadNullable: {
        items: [
          { title: "Manual title", url: "https://example.com/1" },
          { headline: "Second", link: "https://example.com/2" },
        ],
      },
    });
    const response = await manualInputBridgeConnector.fetch(request);
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.payload.raw).toHaveProperty("items");
      expect((response.payload.raw as { items: unknown[] }).items).toHaveLength(2);
    }

    const runResult = await runConnectorWithNormalize(
      request,
      manualInputBridgeConnector,
      jsonApiNormalizationAdapter,
    );
    expect(runResult.outcome).toBe("success");
    if (runResult.outcome === "success") {
      expect(runResult.itemCount).toBe(2);
      expect(runResult.normalizedPayload.items).toHaveLength(2);
      expect(runResult.normalizedPayload.items[0]!.headline).toBe("Manual title");
      expect(runResult.normalizedPayload.items[1]!.headline).toBe("Second");
    }
  });

  it("fetch returns invalid input when item lacks title and url", async () => {
    const request = createDiscoveryFetchRequest({
      sourceDefinition: manualSourceDefinition,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
      manualPayloadNullable: {
        items: [{ title: "Only title" }],
      },
    });
    const response = await manualInputBridgeConnector.fetch(request);
    expect(response.ok).toBe(false);
    if (!response.ok) {
      expect(response.failure.code).toBe("INVALID_INPUT");
    }
  });

  it("runConnectorWithNormalize returns invalidInput outcome with validation failures", async () => {
    const request = createDiscoveryFetchRequest({
      sourceDefinition: manualSourceDefinition,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
      manualPayloadNullable: {
        items: [{ wrong: "field" }],
      },
    });
    const runResult = await runConnectorWithNormalize(
      request,
      manualInputBridgeConnector,
      jsonApiNormalizationAdapter,
    );
    expect(runResult.outcome).toBe("invalid_input");
    if (runResult.outcome === "invalid_input") {
      expect(runResult.validationFailures.length).toBeGreaterThan(0);
    }
  });
});
