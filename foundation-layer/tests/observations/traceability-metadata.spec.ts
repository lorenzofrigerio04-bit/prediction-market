import { describe, expect, it } from "vitest";
import { createTraceabilityMetadata } from "@/index.js";

describe("traceability metadata", () => {
  it("rejects whitespace-only mapping strategy ids", () => {
    expect(() =>
      createTraceabilityMetadata({
        normalizerVersion: "norm-v1",
        mappingStrategyIds: [" "],
        isTraceabilityComplete: true,
        provenanceChain: ["fetch:source"],
      }),
    ).toThrow();

    expect(() =>
      createTraceabilityMetadata({
        normalizerVersion: "norm-v1",
        mappingStrategyIds: ["valid-mapper", "   "],
        isTraceabilityComplete: true,
        provenanceChain: ["fetch:source"],
      }),
    ).toThrow();
  });

  it("accepts non-empty mapping strategy ids", () => {
    const metadata = createTraceabilityMetadata({
      normalizerVersion: "norm-v1",
      mappingStrategyIds: ["mapper-a"],
      isTraceabilityComplete: true,
      provenanceChain: ["fetch:source", "normalize:mapper-a"],
    });
    expect(metadata.mappingStrategyIds).toEqual(["mapper-a"]);
  });
});
