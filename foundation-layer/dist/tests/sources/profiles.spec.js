import { describe, expect, it } from "vitest";
import { ConflictRiskLevel, RecencyPriority, ResolutionEligibility, createFreshnessProfile, createReliabilityProfile, validateFreshnessProfile, validateReliabilityProfile, } from "@/index.js";
describe("source profiles", () => {
    it("reliability profile range validation", () => {
        expect(() => createReliabilityProfile({
            authorityScore: -0.1,
            historicalStabilityScore: 0.8,
            resolutionEligibility: ResolutionEligibility.RESTRICTED,
            conflictRiskLevel: ConflictRiskLevel.LOW,
        })).toThrow();
        const valid = createReliabilityProfile({
            authorityScore: 0.2,
            historicalStabilityScore: 0.9,
            resolutionEligibility: ResolutionEligibility.ELIGIBLE,
            conflictRiskLevel: ConflictRiskLevel.MEDIUM,
        });
        expect(validateReliabilityProfile(valid).isValid).toBe(true);
    });
    it("freshness profile validation", () => {
        expect(() => createFreshnessProfile({
            expectedUpdateFrequency: "daily",
            freshnessTtl: -1,
            recencyPriority: RecencyPriority.HIGH,
        })).toThrow();
        const valid = createFreshnessProfile({
            expectedUpdateFrequency: "daily",
            freshnessTtl: 86400,
            recencyPriority: RecencyPriority.MEDIUM,
        });
        expect(validateFreshnessProfile(valid).isValid).toBe(true);
    });
    it("resolution eligibility is not inferred from authority score", () => {
        const profile = createReliabilityProfile({
            authorityScore: 0.99,
            historicalStabilityScore: 0.99,
            resolutionEligibility: ResolutionEligibility.INELIGIBLE,
            conflictRiskLevel: ConflictRiskLevel.HIGH,
        });
        expect(profile.resolutionEligibility).toBe(ResolutionEligibility.INELIGIBLE);
    });
});
//# sourceMappingURL=profiles.spec.js.map