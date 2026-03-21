import { describe, expect, it } from "vitest";
import { createEntityVersion } from "@/value-objects/entity-version.vo.js";
import { createMarketDraftPipelineId, createTitleSetId } from "@/publishing/value-objects/publishing-ids.vo.js";
import { createTitleSet, type TitleSet } from "@/publishing/titles/entities/title-set.entity.js";
import { TitleGenerationStatus } from "@/publishing/enums/title-generation-status.enum.js";
import { validateTitleSet } from "@/publishing/validators/validate-title-set.js";

describe("TitleSet", () => {
  it("accepts a valid title set", () => {
    const titleSet = createTitleSet({
      id: createTitleSetId("tset_validtitle01"),
      version: createEntityVersion(1),
      market_draft_pipeline_id: createMarketDraftPipelineId("mdp_validpipe001"),
      canonical_title: "Will the Federal Reserve announce a policy rate decision by July 31, 2026?",
      display_title: "Federal Reserve policy rate decision by July 31, 2026",
      subtitle: "Resolution follows deterministic source and deadline policy.",
      title_generation_status: TitleGenerationStatus.GENERATED,
      generation_metadata: { generator: "test" },
    });
    expect(validateTitleSet(titleSet).isValid).toBe(true);
  });

  it("rejects empty canonical title", () => {
    expect(() =>
      createTitleSet({
        id: createTitleSetId("tset_emptycanon01"),
        version: createEntityVersion(1),
        market_draft_pipeline_id: createMarketDraftPipelineId("mdp_validpipe001"),
        canonical_title: "   ",
        display_title: "Display title",
        subtitle: null,
        title_generation_status: TitleGenerationStatus.GENERATED,
        generation_metadata: {},
      }),
    ).toThrow();
  });

  it("rejects contradictory display title heuristic", () => {
    expect(() =>
      createTitleSet({
        id: createTitleSetId("tset_contradict1"),
        version: createEntityVersion(1),
        market_draft_pipeline_id: createMarketDraftPipelineId("mdp_validpipe001"),
        canonical_title: "Will Bitcoin close above $100k by year-end?",
        display_title: "Bitcoin will not close above $100k by year-end",
        subtitle: null,
        title_generation_status: TitleGenerationStatus.GENERATED,
        generation_metadata: {},
      }),
    ).toThrow();
  });

  it("rejects subtitle introducing contractual condition", () => {
    expect(() =>
      createTitleSet({
        id: createTitleSetId("tset_badsubtitl1"),
        version: createEntityVersion(1),
        market_draft_pipeline_id: createMarketDraftPipelineId("mdp_validpipe001"),
        canonical_title: "Will the event happen by 2026?",
        display_title: "Will the event happen by 2026",
        subtitle: "Resolves yes only if turnout exceeds 65%.",
        title_generation_status: TitleGenerationStatus.GENERATED,
        generation_metadata: {},
      }),
    ).toThrow();
  });

  it("validator rejects schema-valid payload with non-formal canonical title", () => {
    const payload: TitleSet = {
      id: createTitleSetId("tset_validtitle01"),
      version: createEntityVersion(1),
      market_draft_pipeline_id: createMarketDraftPipelineId("mdp_validpipe001"),
      canonical_title: "Fed by July 31?",
      display_title: "Will the Federal Reserve announce policy rate decision by July 31, 2026?",
      subtitle: null,
      title_generation_status: TitleGenerationStatus.GENERATED,
      generation_metadata: {},
    };
    const report = validateTitleSet(payload);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "CANONICAL_TITLE_NOT_FORMAL_ENOUGH")).toBe(true);
  });

  it("validator rejects schema-valid contradictory display title", () => {
    const payload: TitleSet = {
      id: createTitleSetId("tset_validtitle02"),
      version: createEntityVersion(1),
      market_draft_pipeline_id: createMarketDraftPipelineId("mdp_validpipe001"),
      canonical_title: "Will Bitcoin close above $100k by year-end?",
      display_title: "Bitcoin will not close above $100k by year-end",
      subtitle: null,
      title_generation_status: TitleGenerationStatus.GENERATED,
      generation_metadata: {},
    };
    const report = validateTitleSet(payload);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((issue) => issue.code === "DISPLAY_TITLE_NOT_COMPATIBLE")).toBe(true);
  });
});
