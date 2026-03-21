import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRunEventGenV2Pipeline = vi.fn();
const mockGetEligibleStorylines = vi.fn();

vi.mock("../../event-gen-v2", () => ({
  runEventGenV2Pipeline: (...args: unknown[]) => mockRunEventGenV2Pipeline(...args),
}));

vi.mock("../../storyline-engine", () => ({
  getEligibleStorylines: (...args: unknown[]) => mockGetEligibleStorylines(...args),
}));

vi.mock("../../event-generation-v2", () => ({
  generateEventsFromEligibleStorylines: vi.fn(),
}));

vi.mock("../../event-publishing", () => ({
  scoreCandidates: vi.fn(),
  dedupCandidates: vi.fn(),
  selectCandidates: vi.fn(),
  selectCandidatesWithInfo: vi.fn(),
  publishSelected: vi.fn(),
  computeDedupKey: vi.fn(),
}));

describe("runPipelineV2 legacy rollback gate", () => {
  const originalEnableLegacyPipeline = process.env.ENABLE_LEGACY_PIPELINE_V2;
  const prisma = {
    sourceArticle: { count: vi.fn() },
    sourceCluster: { count: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ENABLE_LEGACY_PIPELINE_V2;
  });

  afterEach(() => {
    if (originalEnableLegacyPipeline === undefined) {
      delete process.env.ENABLE_LEGACY_PIPELINE_V2;
    } else {
      process.env.ENABLE_LEGACY_PIPELINE_V2 = originalEnableLegacyPipeline;
    }
  });

  it("uses the bridged MDE/event-gen-v2 path by default", async () => {
    mockRunEventGenV2Pipeline.mockResolvedValue({
      eligibleStorylinesCount: 4,
      candidatesCount: 6,
      rulebookValidCount: 5,
      dedupedCandidatesCount: 4,
      selectedCount: 2,
      createdCount: 2,
      skippedCount: 0,
      reasonsCount: { DUPLICATE_IN_DB: 1 },
    });

    const { runPipelineV2 } = await import("../runPipelineV2");
    const result = await runPipelineV2({
      prisma: prisma as never,
      now: new Date("2026-03-09T12:00:00.000Z"),
      dryRun: false,
    });

    expect(mockRunEventGenV2Pipeline).toHaveBeenCalledTimes(1);
    expect(mockGetEligibleStorylines).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      eligibleStorylinesCount: 4,
      candidatesCount: 6,
      verifiedCandidatesCount: 5,
      dedupedCandidatesCount: 4,
      selectedCount: 2,
      createdCount: 2,
      skippedCount: 0,
      reasonsCount: { DUPLICATE_IN_DB: 1 },
    });
  });

  it("always uses runEventGenV2Pipeline even when ENABLE_LEGACY_PIPELINE_V2 is set", async () => {
    process.env.ENABLE_LEGACY_PIPELINE_V2 = "true";
    mockRunEventGenV2Pipeline.mockResolvedValue({
      eligibleStorylinesCount: 2,
      candidatesCount: 3,
      rulebookValidCount: 2,
      dedupedCandidatesCount: 2,
      selectedCount: 1,
      createdCount: 1,
      skippedCount: 0,
      reasonsCount: {},
    });

    const { runPipelineV2 } = await import("../runPipelineV2");
    const result = await runPipelineV2({
      prisma: prisma as never,
      now: new Date("2026-03-09T12:00:00.000Z"),
      dryRun: false,
    });

    expect(mockRunEventGenV2Pipeline).toHaveBeenCalledTimes(1);
    expect(mockGetEligibleStorylines).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      eligibleStorylinesCount: 2,
      candidatesCount: 3,
      verifiedCandidatesCount: 2,
      dedupedCandidatesCount: 2,
      selectedCount: 1,
      createdCount: 1,
      skippedCount: 0,
      reasonsCount: {},
    });
  });
});
