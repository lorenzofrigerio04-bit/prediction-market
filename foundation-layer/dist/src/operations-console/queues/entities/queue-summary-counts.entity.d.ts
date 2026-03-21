import type { SummaryCount } from "../../value-objects/summary-count.vo.js";
export type QueueSummaryCounts = Readonly<{
    total: SummaryCount;
    ready: SummaryCount;
    blocked: SummaryCount;
    warnings: SummaryCount;
}>;
export declare const createQueueSummaryCounts: (input: QueueSummaryCounts) => QueueSummaryCounts;
//# sourceMappingURL=queue-summary-counts.entity.d.ts.map