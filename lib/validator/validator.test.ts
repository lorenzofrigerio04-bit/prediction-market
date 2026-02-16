/**
 * Unit tests for market validator rules and main validator.
 */

import { describe, it, expect } from "vitest";
import {
  checkAmbiguousWording,
  checkMissingResolutionSource,
  checkResolutionSourceDomain,
  checkNonBinary,
  checkTimeIncoherent,
  checkPastEvent,
  checkTooFarFuture,
  checkSubjectiveInterpretation,
  checkMultipleOutcomes,
  checkSourceReliabilityUncertain,
  checkEdgeCaseTiming,
  runHardFailRules,
  runNeedsReviewRules,
  DEFAULT_VALIDATOR_CONFIG,
} from "./rules";
import { validateMarket } from "./validator";
import type { MarketValidationInput } from "./types";

const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const farFutureDate = new Date(Date.now() + 800 * 24 * 60 * 60 * 1000).toISOString();

function makeInput(overrides?: Partial<MarketValidationInput>): MarketValidationInput {
  return {
    title: "Will Bitcoin reach $100k by end of 2025?",
    description: "Bitcoin price prediction",
    closesAt: futureDate,
    resolutionSourceUrl: "https://www.coingecko.com/en/coins/bitcoin",
    resolutionNotes: "Check price on Coingecko",
    ...overrides,
  };
}

describe("Hard fail rules", () => {
  describe("checkAmbiguousWording", () => {
    it("should reject 'might'", () => {
      const result = checkAmbiguousWording(makeInput({ title: "Might Bitcoin reach $100k?" }));
      expect(result).toContain("Ambiguous wording");
    });

    it("should reject 'could'", () => {
      const result = checkAmbiguousWording(makeInput({ title: "Could Bitcoin reach $100k?" }));
      expect(result).toContain("Ambiguous wording");
    });

    it("should reject 'forse' (Italian)", () => {
      const result = checkAmbiguousWording(makeInput({ title: "Forse Bitcoin raggiungerà $100k?" }));
      expect(result).toContain("Ambiguous wording");
    });

    it("should reject 'potrebbe' (Italian)", () => {
      const result = checkAmbiguousWording(makeInput({ title: "Bitcoin potrebbe raggiungere $100k?" }));
      expect(result).toContain("Ambiguous wording");
    });

    it("should pass clear wording", () => {
      const result = checkAmbiguousWording(makeInput({ title: "Will Bitcoin reach $100k?" }));
      expect(result).toBeNull();
    });
  });

  describe("checkMissingResolutionSource", () => {
    it("should reject missing URL", () => {
      const result = checkMissingResolutionSource(makeInput({ resolutionSourceUrl: null }));
      expect(result).toContain("Missing resolution source");
    });

    it("should reject empty URL", () => {
      const result = checkMissingResolutionSource(makeInput({ resolutionSourceUrl: "" }));
      expect(result).toContain("Missing resolution source");
    });

    it("should reject invalid URL", () => {
      const result = checkMissingResolutionSource(makeInput({ resolutionSourceUrl: "not-a-url" }));
      expect(result).toContain("Missing resolution source");
    });

    it("should pass valid URL", () => {
      const result = checkMissingResolutionSource(makeInput());
      expect(result).toBeNull();
    });
  });

  describe("checkResolutionSourceDomain", () => {
    it("should reject blacklisted domain", () => {
      const config = { ...DEFAULT_VALIDATOR_CONFIG, domainBlacklist: ["example.com"] };
      const result = checkResolutionSourceDomain(
        makeInput({ resolutionSourceUrl: "https://example.com/news" }),
        config
      );
      expect(result).toContain("not allowed");
    });

    it("should reject domain not in whitelist when whitelist exists", () => {
      const config = {
        ...DEFAULT_VALIDATOR_CONFIG,
        domainWhitelist: ["coingecko.com"],
        domainBlacklist: [],
      };
      const result = checkResolutionSourceDomain(
        makeInput({ resolutionSourceUrl: "https://example.com/news" }),
        config
      );
      expect(result).toContain("not allowed");
    });

    it("should pass allowed domain", () => {
      const config = { ...DEFAULT_VALIDATOR_CONFIG, domainBlacklist: [] };
      const result = checkResolutionSourceDomain(makeInput(), config);
      expect(result).toBeNull();
    });
  });

  describe("checkNonBinary", () => {
    it("should reject 'how many'", () => {
      const result = checkNonBinary(makeInput({ title: "How many goals will be scored?" }));
      expect(result).toContain("Non-binary outcome");
    });

    it("should reject 'which one'", () => {
      const result = checkNonBinary(makeInput({ title: "Which team will win?" }));
      expect(result).toContain("Non-binary outcome");
    });

    it("should reject 'quanto' (Italian)", () => {
      const result = checkNonBinary(makeInput({ title: "Quanto costerà Bitcoin?" }));
      expect(result).toContain("Non-binary outcome");
    });

    it("should reject 'chi vincerà' (Italian)", () => {
      const result = checkNonBinary(makeInput({ title: "Chi vincerà le elezioni?" }));
      expect(result).toContain("Non-binary outcome");
    });

    it("should pass binary question", () => {
      const result = checkNonBinary(makeInput({ title: "Will Bitcoin reach $100k?" }));
      expect(result).toBeNull();
    });
  });

  describe("checkTimeIncoherent", () => {
    it("should reject closesAt far from outcome date in text", () => {
      const closesAt = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString();
      const result = checkTimeIncoherent(
        makeInput({
          title: "Will Bitcoin reach $100k fine 2025?",
          closesAt,
        }),
        DEFAULT_VALIDATOR_CONFIG
      );
      expect(result).toBeTruthy();
      expect(result).toContain("Time incoherence");
    });

    it("should pass when closesAt aligns with outcome date", () => {
      const outcomeDate = new Date(Date.now() + 200 * 24 * 60 * 60 * 1000);
      const closesAt = new Date(outcomeDate.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const result = checkTimeIncoherent(
        makeInput({
          title: `Will Bitcoin reach $100k by ${outcomeDate.toISOString().slice(0, 10)}?`,
          closesAt,
        }),
        DEFAULT_VALIDATOR_CONFIG
      );
      expect(result).toBeNull();
    });

    it("should pass when no date in text", () => {
      const result = checkTimeIncoherent(
        makeInput({ title: "Will Bitcoin reach $100k?" }),
        DEFAULT_VALIDATOR_CONFIG
      );
      expect(result).toBeNull();
    });
  });

  describe("checkPastEvent", () => {
    it("should reject closesAt in the past", () => {
      const result = checkPastEvent(
        makeInput({ closesAt: pastDate }),
        DEFAULT_VALIDATOR_CONFIG
      );
      expect(result).toContain("Past event");
    });

    it("should reject closesAt too soon", () => {
      const tooSoon = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
      const config = { ...DEFAULT_VALIDATOR_CONFIG, minHoursFromNow: 24 };
      const result = checkPastEvent(makeInput({ closesAt: tooSoon }), config);
      expect(result).toContain("Past event");
    });

    it("should reject past outcome date in text", () => {
      const result = checkPastEvent(
        makeInput({ title: "Will Bitcoin reach $100k fine 2020?" }),
        DEFAULT_VALIDATOR_CONFIG
      );
      expect(result).toBeTruthy();
      expect(result).toContain("Past event");
    });

    it("should pass future closesAt", () => {
      const result = checkPastEvent(makeInput(), DEFAULT_VALIDATOR_CONFIG);
      expect(result).toBeNull();
    });
  });

  describe("checkTooFarFuture", () => {
    it("should reject closesAt beyond max horizon", () => {
      const result = checkTooFarFuture(
        makeInput({ closesAt: farFutureDate }),
        DEFAULT_VALIDATOR_CONFIG
      );
      expect(result).toContain("Too far future");
    });

    it("should reject outcome date beyond max horizon", () => {
      const result = checkTooFarFuture(
        makeInput({ title: "Will Bitcoin reach $100k fine 2030?" }),
        DEFAULT_VALIDATOR_CONFIG
      );
      expect(result).toBeTruthy();
      expect(result).toContain("Too far future");
    });

    it("should pass within horizon", () => {
      const result = checkTooFarFuture(makeInput(), DEFAULT_VALIDATOR_CONFIG);
      expect(result).toBeNull();
    });
  });
});

describe("Needs review rules", () => {
  describe("checkSubjectiveInterpretation", () => {
    it("should flag 'better'", () => {
      const result = checkSubjectiveInterpretation(makeInput({ title: "Will Bitcoin perform better?" }));
      expect(result).toContain("Subjective interpretation");
    });

    it("should flag 'success'", () => {
      const result = checkSubjectiveInterpretation(makeInput({ title: "Will this be a success?" }));
      expect(result).toContain("Subjective interpretation");
    });

    it("should flag 'migliore' (Italian)", () => {
      const result = checkSubjectiveInterpretation(makeInput({ title: "Sarà migliore?" }));
      expect(result).toContain("Subjective interpretation");
    });

    it("should pass objective wording", () => {
      const result = checkSubjectiveInterpretation(makeInput());
      expect(result).toBeNull();
    });
  });

  describe("checkMultipleOutcomes", () => {
    it("should flag 'multiple options'", () => {
      const result = checkMultipleOutcomes(makeInput({ title: "Will one of multiple options win?" }));
      expect(result).toContain("Multiple outcomes");
    });

    it("should pass binary question", () => {
      const result = checkMultipleOutcomes(makeInput());
      expect(result).toBeNull();
    });
  });

  describe("checkSourceReliabilityUncertain", () => {
    it("should flag 'blog' in URL", () => {
      const result = checkSourceReliabilityUncertain(
        makeInput({ resolutionSourceUrl: "https://blog.example.com/news" })
      );
      expect(result).toContain("Source reliability uncertain");
    });

    it("should flag 'rumor' in text", () => {
      const result = checkSourceReliabilityUncertain(
        makeInput({ description: "According to rumors" })
      );
      expect(result).toContain("Source reliability uncertain");
    });

    it("should pass reliable source", () => {
      const result = checkSourceReliabilityUncertain(makeInput());
      expect(result).toBeNull();
    });
  });

  describe("checkEdgeCaseTiming", () => {
    it("should flag 'end of day'", () => {
      const result = checkEdgeCaseTiming(makeInput({ title: "Will Bitcoin reach $100k by end of day?" }));
      expect(result).toContain("Edge case timing");
    });

    it("should flag 'midnight'", () => {
      const result = checkEdgeCaseTiming(makeInput({ title: "Will Bitcoin reach $100k by midnight?" }));
      expect(result).toContain("Edge case timing");
    });

    it("should flag 'entro fine anno' (Italian)", () => {
      const result = checkEdgeCaseTiming(makeInput({ title: "Bitcoin raggiungerà $100k entro fine anno?" }));
      expect(result).toContain("Edge case timing");
    });

    it("should pass clear timing", () => {
      const result = checkEdgeCaseTiming(makeInput());
      expect(result).toBeNull();
    });
  });
});

describe("Rule aggregators", () => {
  describe("runHardFailRules", () => {
    it("should return multiple reasons", () => {
      const reasons = runHardFailRules(
        makeInput({
          title: "Might Bitcoin reach $100k?",
          resolutionSourceUrl: null,
        }),
        DEFAULT_VALIDATOR_CONFIG
      );
      expect(reasons.length).toBeGreaterThan(1);
      expect(reasons.some((r) => r.includes("Ambiguous wording"))).toBe(true);
      expect(reasons.some((r) => r.includes("Missing resolution source"))).toBe(true);
    });

    it("should return empty array for valid input", () => {
      const reasons = runHardFailRules(makeInput(), DEFAULT_VALIDATOR_CONFIG);
      expect(reasons).toEqual([]);
    });
  });

  describe("runNeedsReviewRules", () => {
    it("should return multiple reasons", () => {
      const reasons = runNeedsReviewRules(
        makeInput({
          title: "Will Bitcoin perform better by end of day?",
          resolutionSourceUrl: "https://blog.example.com/news",
        })
      );
      expect(reasons.length).toBeGreaterThan(1);
    });

    it("should return empty array for clean input", () => {
      const reasons = runNeedsReviewRules(makeInput());
      expect(reasons).toEqual([]);
    });
  });
});

describe("validateMarket", () => {
  it("should return valid: false when hard fail", () => {
    const result = validateMarket(
      makeInput({
        title: "Might Bitcoin reach $100k?",
        resolutionSourceUrl: null,
      })
    );
    expect(result.valid).toBe(false);
    expect(result.needsReview).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("should return valid: true, needsReview: true when flagged", () => {
    const result = validateMarket(
      makeInput({
        title: "Will Bitcoin perform better by end of day?",
      })
    );
    expect(result.valid).toBe(true);
    expect(result.needsReview).toBe(true);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("should return valid: true, needsReview: false for clean input", () => {
    const result = validateMarket(makeInput());
    expect(result.valid).toBe(true);
    expect(result.needsReview).toBe(false);
    expect(result.reasons).toEqual([]);
  });

  it("should respect custom config", () => {
    const config = {
      ...DEFAULT_VALIDATOR_CONFIG,
      domainBlacklist: ["coingecko.com"],
    };
    const result = validateMarket(makeInput(), config);
    expect(result.valid).toBe(false);
    expect(result.reasons.some((r) => r.includes("not allowed"))).toBe(true);
  });
});
