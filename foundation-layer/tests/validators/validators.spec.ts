import { describe, expect, it } from "vitest";
import { createCandidateMarket } from "@/entities/candidate-market.entity.js";
import { createMarketOutcome } from "@/entities/market-outcome.entity.js";
import { createSourceRecord } from "@/entities/source-record.entity.js";
import { CandidateOutcomeType } from "@/enums/candidate-outcome-type.enum.js";
import { MarketResolutionBasis } from "@/enums/market-resolution-basis.enum.js";
import { MarketType } from "@/enums/market-type.enum.js";
import { SourceType } from "@/enums/source-type.enum.js";
import { validateCandidateMarket } from "@/validators/candidate-market.validator.js";
import { validateSourceRecord } from "@/validators/source-record.validator.js";
import {
  createCandidateMarketId,
  createClaimId,
  createConfidenceScore,
  createDescription,
  createEntityVersion,
  createEventId,
  createOutcomeId,
  createResolutionWindow,
  createSlug,
  createSourceId,
  createTag,
  createTimestamp,
  createTitle,
} from "@/index.js";
import type { ValidationIssue } from "@/entities/validation-report.entity.js";

describe("validators", () => {
  it("rejects additional properties via schema validation", () => {
    const input = {
      id: createSourceId("src_abcdefg"),
      sourceType: SourceType.NEWS_ARTICLE,
      sourceName: "Reuters",
      sourceAuthorityScore: createConfidenceScore(0.9),
      title: createTitle("Headline"),
      description: createDescription("Summary"),
      url: null,
      publishedAt: null,
      capturedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
      locale: null,
      tags: [createTag("news")],
      externalRef: null,
      entityVersion: createEntityVersion(),
      extraField: "forbidden",
    };

    const report = validateSourceRecord(input as never);
    expect(report.isValid).toBe(false);
    expect(
      report.issues.some(
        (issue: ValidationIssue) => issue.code === "ADDITIONAL_PROPERTY_NOT_ALLOWED",
      ),
    ).toBe(true);
  });

  it("returns deterministic code for binary market mismatch", () => {
    const maybe = createMarketOutcome({
      id: createOutcomeId("out_abcdefg"),
      outcomeType: CandidateOutcomeType.CUSTOM,
      label: "Maybe",
      shortLabel: null,
      description: null,
      orderIndex: 0,
      probabilityHint: null,
      entityVersion: createEntityVersion(),
    });
    const unclear = createMarketOutcome({
      id: createOutcomeId("out_abcdefh"),
      outcomeType: CandidateOutcomeType.CUSTOM,
      label: "Unclear",
      shortLabel: null,
      description: null,
      orderIndex: 1,
      probabilityHint: null,
      entityVersion: createEntityVersion(),
    });

    const market = createCandidateMarket({
      id: createCandidateMarketId("mkt_abcdefg"),
      claimId: createClaimId("clm_abcdefg"),
      canonicalEventId: createEventId("evt_abcdefg"),
      title: createTitle("Will a bill pass?"),
      slug: createSlug("Will a bill pass?"),
      description: createDescription("Binary market draft"),
      resolutionBasis: MarketResolutionBasis.OFFICIAL_SOURCE,
      resolutionWindow: createResolutionWindow(
        "2026-03-01T00:00:00.000Z",
        "2026-06-01T00:00:00.000Z",
      ),
      outcomes: [maybe, unclear],
      marketType: MarketType.BINARY,
      categories: ["law"],
      tags: [createTag("law")],
      confidenceScore: createConfidenceScore(0.77),
      draftNotes: null,
      entityVersion: createEntityVersion(),
    });

    const report = validateCandidateMarket(market);
    expect(report.isValid).toBe(false);
    expect(report.issues.map((issue: ValidationIssue) => issue.code)).toContain(
      "BINARY_MARKET_OUTCOME_MISMATCH",
    );
  });

  it("produces deterministic generatedAt and stable issue ordering", () => {
    const input = {
      id: createSourceId("src_abcdefg"),
      sourceType: SourceType.NEWS_ARTICLE,
      sourceName: "",
      sourceAuthorityScore: createConfidenceScore(0.9),
      title: createTitle("Headline"),
      description: createDescription("Summary"),
      url: null,
      publishedAt: createTimestamp("2026-03-03T00:00:00.000Z"),
      capturedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
      locale: null,
      tags: [createTag("news"), createTag("news")],
      externalRef: null,
      entityVersion: createEntityVersion(),
      extraField: "forbidden",
    };

    const generatedAt = createTimestamp("2026-03-10T00:00:00.000Z");
    const report1 = validateSourceRecord(input as never, { generatedAt });
    const report2 = validateSourceRecord(input as never, { generatedAt });

    expect(report1.generatedAt).toBe(generatedAt);
    expect(report2.generatedAt).toBe(generatedAt);
    expect(report1.issues.map((issue) => `${issue.path}|${issue.code}|${issue.message}`)).toEqual(
      report2.issues.map((issue) => `${issue.path}|${issue.code}|${issue.message}`),
    );

    const sorted = [...report1.issues].sort((left, right) => {
      const pathDiff = left.path.localeCompare(right.path);
      if (pathDiff !== 0) {
        return pathDiff;
      }
      const codeDiff = left.code.localeCompare(right.code);
      if (codeDiff !== 0) {
        return codeDiff;
      }
      return left.message.localeCompare(right.message);
    });
    expect(report1.issues).toEqual(sorted);
  });
});
