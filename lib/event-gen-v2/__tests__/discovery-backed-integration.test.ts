/**
 * Tests for discovery-backed pipeline integration: runtime path, result shape, gating.
 * Fixtures and mocks only; no live network or DB.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { runDiscoveryBackedEventGenPath } from "../discovery-backed-integration";
import { runEventGenV2Pipeline } from "../run-pipeline";

const mockPrisma = {
  pipelineRun: { create: vi.fn().mockResolvedValue({}) },
  sourceCluster: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn().mockResolvedValue(null) },
  sourceArticle: { findMany: vi.fn().mockResolvedValue([]) },
  event: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn().mockResolvedValue({ id: "e1" }) },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../trend-detection", () => ({ getTrends: vi.fn().mockResolvedValue({ trends: [] }) }));
vi.mock("../storyline-engine", () => ({ getEligibleStorylines: vi.fn().mockResolvedValue({ eligible: [] }) }));
// Avoid invoking real discovery supplier (network) in integration tests; stub returns [].
vi.mock("../discovery-lead-supplier", () => ({
  runDiscoveryLeadSupplier: vi.fn().mockResolvedValue({
    leads: [],
    report: {
      sourcesAttempted: 0,
      sourcesSucceeded: 0,
      sourcesFailed: 0,
      sourceFailures: [],
      normalizedItemsCount: 0,
      eventLeadCount: 0,
    },
  }),
}));

describe("runDiscoveryBackedEventGenPath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.pipelineRun.create.mockResolvedValue({});
  });

  it("returns result with discoveryBacked, leadCount 0, conversionCount 0 when stub returns no leads", async () => {
    const result = await runDiscoveryBackedEventGenPath({
      prisma: mockPrisma as any,
      now: new Date(),
      dryRun: true,
      runId: "test-run-1",
    });

    expect(result.discoveryBacked).toBe(true);
    expect(result.leadCount).toBe(0);
    expect(result.conversionCount).toBe(0);
    expect(result.observationIds).toEqual([]);
    expect(result.publishableFromDiscovery).toBe(0);
    expect(result.eligibleStorylinesCount).toBe(0);
    expect(result.candidatesCount).toBe(0);
    expect(result.createdCount).toBe(0);
  });

  it("propagates structured result fields (observationIds, publishableFromDiscovery)", async () => {
    const result = await runDiscoveryBackedEventGenPath({
      prisma: mockPrisma as any,
      now: new Date(),
      dryRun: true,
      runId: "test-run-2",
    });

    expect(result).toHaveProperty("observationIds");
    expect(Array.isArray(result.observationIds)).toBe(true);
    expect(result).toHaveProperty("publishableFromDiscovery");
    expect(typeof result.publishableFromDiscovery).toBe("number");
  });

  it("skipped/not-ready leads produce 0 candidates (stub returns no leads)", async () => {
    const result = await runDiscoveryBackedEventGenPath({
      prisma: mockPrisma as any,
      now: new Date(),
      dryRun: true,
      runId: "test-run-3",
    });
    expect(result.candidatesCount).toBe(0);
    expect(result.publishableFromDiscovery).toBe(0);
    expect(result.conversionCount).toBe(0);
  });
});

describe("runEventGenV2Pipeline gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.USE_DISCOVERY_BACKED_PIPELINE;
    delete process.env.CANDIDATE_EVENT_GEN;
    mockPrisma.pipelineRun.create.mockResolvedValue({});
  });

  it("when USE_DISCOVERY_BACKED_PIPELINE is not set, result does not have discoveryBacked", async () => {
    process.env.CANDIDATE_EVENT_GEN = "true";
    const result = await runEventGenV2Pipeline({
      prisma: mockPrisma as any,
      now: new Date(),
      dryRun: true,
    });
    expect(result.discoveryBacked).toBeUndefined();
  });

  it("when USE_DISCOVERY_BACKED_PIPELINE=true, result has discoveryBacked and leadCount", async () => {
    process.env.USE_DISCOVERY_BACKED_PIPELINE = "true";
    const result = await runEventGenV2Pipeline({
      prisma: mockPrisma as any,
      now: new Date(),
      dryRun: true,
    });
    expect(result.discoveryBacked).toBe(true);
    expect(result.leadCount).toBe(0);
    expect(result.conversionCount).toBe(0);
  });

  it("when USE_DISCOVERY_BACKED_PIPELINE=true, result includes all discovery-specific fields", async () => {
    process.env.USE_DISCOVERY_BACKED_PIPELINE = "true";
    const result = await runEventGenV2Pipeline({
      prisma: mockPrisma as any,
      now: new Date(),
      dryRun: true,
    });
    expect(result.discoveryBacked).toBe(true);
    expect(typeof result.leadCount).toBe("number");
    expect(typeof result.conversionCount).toBe("number");
    expect(Array.isArray(result.observationIds)).toBe(true);
    expect(typeof result.publishableFromDiscovery).toBe("number");
  });
});
