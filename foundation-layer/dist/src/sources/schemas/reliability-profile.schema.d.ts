import { ConflictRiskLevel } from "../enums/conflict-risk-level.enum.js";
import { ResolutionEligibility } from "../enums/resolution-eligibility.enum.js";
export declare const RELIABILITY_PROFILE_SCHEMA_ID = "https://market-design-engine.dev/schemas/sources/reliability-profile.schema.json";
export declare const reliabilityProfileSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/sources/reliability-profile.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["authorityScore", "historicalStabilityScore", "resolutionEligibility", "conflictRiskLevel"];
    readonly properties: {
        readonly authorityScore: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly historicalStabilityScore: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly resolutionEligibility: {
            readonly type: "string";
            readonly enum: ResolutionEligibility[];
        };
        readonly conflictRiskLevel: {
            readonly type: "string";
            readonly enum: ConflictRiskLevel[];
        };
    };
};
//# sourceMappingURL=reliability-profile.schema.d.ts.map