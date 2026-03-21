import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { SummaryCount } from "../../value-objects/summary-count.vo.js";

export type QueueSummaryCounts = Readonly<{
  total: SummaryCount;
  ready: SummaryCount;
  blocked: SummaryCount;
  warnings: SummaryCount;
}>;

export const createQueueSummaryCounts = (input: QueueSummaryCounts): QueueSummaryCounts => deepFreeze({ ...input });
