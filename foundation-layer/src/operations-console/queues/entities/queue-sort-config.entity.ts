import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { SortDirection } from "../../enums/sort-direction.enum.js";
import type { SortField } from "../../value-objects/sort-field.vo.js";

export type QueueSortConfig = Readonly<{
  sort_field: SortField;
  sort_direction: SortDirection;
}>;

export const createQueueSortConfig = (input: QueueSortConfig): QueueSortConfig => deepFreeze({ ...input });
