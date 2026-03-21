import { describe, expect, it } from "vitest";
import { createDependencyLink } from "../../src/frontier-markets/dependencies/entities/dependency-link.entity.js";
import { DependencyStrength } from "../../src/frontier-markets/enums/dependency-strength.enum.js";
import { DependencyType } from "../../src/frontier-markets/enums/dependency-type.enum.js";
import { createDependencyLinkId } from "../../src/frontier-markets/value-objects/frontier-market-ids.vo.js";
import { validateDependencyLink } from "../../src/frontier-markets/validators/validate-dependency-link.js";

const makeValidDependencyLink = () =>
  createDependencyLink({
    id: createDependencyLinkId("fdp_frontier001"),
    source_ref: { ref_type: "event", ref_id: "cevt_frontier004" },
    target_ref: { ref_type: "market", ref_id: "mkt_frontier004" },
    dependency_type: DependencyType.EVENT_TO_MARKET,
    dependency_strength: DependencyStrength.STRONG,
    blocking: true,
  });

describe("DependencyLink", () => {
  it("valid DependencyLink", () => {
    const report = validateDependencyLink(makeValidDependencyLink());
    expect(report.isValid).toBe(true);
  });

  it("invalid blocking DependencyLink with inconsistent strength", () => {
    const invalid = {
      ...makeValidDependencyLink(),
      dependency_strength: DependencyStrength.WEAK,
    };
    const report = validateDependencyLink(invalid);
    expect(report.isValid).toBe(false);
  });
});
