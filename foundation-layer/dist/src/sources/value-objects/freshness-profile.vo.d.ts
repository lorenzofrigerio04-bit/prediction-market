import { RecencyPriority } from "../enums/recency-priority.enum.js";
export type FreshnessProfile = Readonly<{
    expectedUpdateFrequency: string;
    freshnessTtl: number;
    recencyPriority: RecencyPriority;
}>;
export declare const createFreshnessProfile: (input: FreshnessProfile) => FreshnessProfile;
//# sourceMappingURL=freshness-profile.vo.d.ts.map