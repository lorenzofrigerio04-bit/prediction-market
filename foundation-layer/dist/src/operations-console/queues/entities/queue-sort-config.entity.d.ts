import { SortDirection } from "../../enums/sort-direction.enum.js";
import type { SortField } from "../../value-objects/sort-field.vo.js";
export type QueueSortConfig = Readonly<{
    sort_field: SortField;
    sort_direction: SortDirection;
}>;
export declare const createQueueSortConfig: (input: QueueSortConfig) => QueueSortConfig;
//# sourceMappingURL=queue-sort-config.entity.d.ts.map