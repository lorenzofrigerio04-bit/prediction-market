import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { QueueFilter } from "../../queues/entities/queue-filter.entity.js";

export type ConsoleFilterState = Readonly<{
  filters: readonly QueueFilter[];
}>;

export const createConsoleFilterState = (input: ConsoleFilterState): ConsoleFilterState => deepFreeze({ ...input });
