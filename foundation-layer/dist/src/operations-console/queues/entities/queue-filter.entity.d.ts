import { FilterOperator } from "../../enums/filter-operator.enum.js";
import type { FilterToken } from "../../value-objects/filter-token.vo.js";
export type QueueFilter = Readonly<{
    field: string;
    operator: FilterOperator;
    value: FilterToken;
}>;
export declare const createQueueFilter: (input: QueueFilter) => QueueFilter;
//# sourceMappingURL=queue-filter.entity.d.ts.map