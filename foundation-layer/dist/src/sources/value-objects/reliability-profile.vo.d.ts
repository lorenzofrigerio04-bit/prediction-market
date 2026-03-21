import { ConflictRiskLevel } from "../enums/conflict-risk-level.enum.js";
import { ResolutionEligibility } from "../enums/resolution-eligibility.enum.js";
export type ReliabilityProfile = Readonly<{
    authorityScore: number;
    historicalStabilityScore: number;
    resolutionEligibility: ResolutionEligibility;
    conflictRiskLevel: ConflictRiskLevel;
}>;
export declare const createReliabilityProfile: (input: ReliabilityProfile) => ReliabilityProfile;
//# sourceMappingURL=reliability-profile.vo.d.ts.map