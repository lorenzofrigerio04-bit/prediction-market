import type { QueueFilter } from "../../queues/entities/queue-filter.entity.js";
export type ConsoleFilterState = Readonly<{
    filters: readonly QueueFilter[];
}>;
export declare const createConsoleFilterState: (input: ConsoleFilterState) => ConsoleFilterState;
//# sourceMappingURL=console-filter-state.entity.d.ts.map