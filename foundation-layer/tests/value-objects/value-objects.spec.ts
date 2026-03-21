import { describe, expect, it } from "vitest";
import { createConfidenceScore, toConfidenceTier } from "@/value-objects/confidence-score.vo.js";
import { createSourceId } from "@/value-objects/source-id.vo.js";
import { createClaimId } from "@/value-objects/claim-id.vo.js";
import { createCandidateMarketId } from "@/value-objects/candidate-market-id.vo.js";
import { createOutcomeId } from "@/value-objects/outcome-id.vo.js";
import { createEntityVersion } from "@/value-objects/entity-version.vo.js";
import { createEventId } from "@/value-objects/event-id.vo.js";
import { createLocale } from "@/value-objects/locale.vo.js";
import { createMoney } from "@/value-objects/money.vo.js";
import { createProbability } from "@/value-objects/probability.vo.js";
import { createResolutionWindow } from "@/value-objects/timestamp.vo.js";
import { createSlug } from "@/value-objects/slug.vo.js";
import { createUrl } from "@/value-objects/url.vo.js";
import { ConfidenceTier } from "@/enums/confidence-tier.enum.js";

describe("value objects", () => {
  it("normalizes slug into kebab-case", () => {
    expect(createSlug("  US CPI Release: March  ")).toBe("us-cpi-release-march");
  });

  it("rejects invalid probability boundaries", () => {
    expect(() => createProbability(-0.01)).toThrow();
    expect(() => createProbability(1.01)).toThrow();
  });

  it("rejects malformed urls", () => {
    expect(() => createUrl("not-a-url")).toThrow();
    expect(() => createUrl("ftp://example.org")).toThrow();
  });

  it("rejects resolution window with close before open", () => {
    expect(() =>
      createResolutionWindow("2026-01-03T00:00:00.000Z", "2026-01-02T00:00:00.000Z"),
    ).toThrow();
  });

  it("rejects event ids with wrong prefix", () => {
    expect(() => createEventId("src_abcdefg")).toThrow();
  });

  it("validates all prefixed id value objects", () => {
    expect(createEventId("evt_abcdefg")).toBe("evt_abcdefg");
    expect(createSourceId("src_abcdefg")).toBe("src_abcdefg");
    expect(createClaimId("clm_abcdefg")).toBe("clm_abcdefg");
    expect(createCandidateMarketId("mkt_abcdefg")).toBe("mkt_abcdefg");
    expect(createOutcomeId("out_abcdefg")).toBe("out_abcdefg");
    expect(() => createSourceId("src_abc")).toThrow();
    expect(() => createClaimId("evt_abcdefg")).toThrow();
  });

  it("validates entity version boundaries", () => {
    expect(createEntityVersion()).toBe(1);
    expect(createEntityVersion(3)).toBe(3);
    expect(() => createEntityVersion(0)).toThrow();
    expect(() => createEntityVersion(-1)).toThrow();
    expect(() => createEntityVersion(1.5)).toThrow();
  });

  it("validates locale format deterministically", () => {
    expect(createLocale("en")).toBe("en");
    expect(createLocale("it-IT")).toBe("it-IT");
    expect(() => createLocale("EN_us")).toThrow();
    expect(() => createLocale("abc-")).toThrow();
  });

  it("validates and normalizes money payload", () => {
    const money = createMoney("usd", "12.34");
    expect(money.currency).toBe("USD");
    expect(money.amount).toBe("12.34");
    expect(() => createMoney("US", "12.34")).toThrow();
    expect(() => createMoney("USD", "abc")).toThrow();
    expect(() => createMoney("USD", "1.123456789")).toThrow();
    expect(Object.isFrozen(money)).toBe(true);
  });

  it("maps confidence score into deterministic tiers", () => {
    expect(toConfidenceTier(createConfidenceScore(0.1))).toBe(ConfidenceTier.LOW);
    expect(toConfidenceTier(createConfidenceScore(0.5))).toBe(ConfidenceTier.MEDIUM);
    expect(toConfidenceTier(createConfidenceScore(0.9))).toBe(ConfidenceTier.HIGH);
  });
});
