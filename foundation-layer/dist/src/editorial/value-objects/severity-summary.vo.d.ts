export declare const FINDING_SEVERITIES: readonly ["low", "medium", "high", "critical"];
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];
export type SeveritySummary = Readonly<{
    low: number;
    medium: number;
    high: number;
    critical: number;
    highest_severity: FindingSeverity;
    total_findings: number;
}>;
export declare const createSeveritySummary: (input: {
    low: number;
    medium: number;
    high: number;
    critical: number;
}) => SeveritySummary;
//# sourceMappingURL=severity-summary.vo.d.ts.map