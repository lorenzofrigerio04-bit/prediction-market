import { FinalReadinessStatus } from "../enums/final-readiness-status.enum.js";
export type GatingSummary = Readonly<{
    readiness_status: FinalReadinessStatus;
    has_valid_approval: boolean;
    has_terminal_rejection: boolean;
    unresolved_blocking_flags_count: number;
    checks: readonly string[];
}>;
export declare const createGatingSummary: (input: GatingSummary) => GatingSummary;
//# sourceMappingURL=gating-summary.vo.d.ts.map