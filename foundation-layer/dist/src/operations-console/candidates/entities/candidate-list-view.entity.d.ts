import { ViewScope } from "../../enums/view-scope.enum.js";
import type { CandidateListViewId } from "../../value-objects/operations-console-ids.vo.js";
import type { QueueSortConfig } from "../../queues/entities/queue-sort-config.entity.js";
import type { CandidateListEntry } from "./candidate-list-entry.entity.js";
import type { QueueFilter } from "../../queues/entities/queue-filter.entity.js";
export type CandidateListView = Readonly<{
    id: CandidateListViewId;
    version: string;
    view_scope: ViewScope;
    candidate_entries: readonly CandidateListEntry[];
    aggregate_counts: Readonly<Record<string, number>>;
    applied_filters: readonly QueueFilter[];
    sort_config: QueueSortConfig;
}>;
export declare const createCandidateListView: (input: CandidateListView) => CandidateListView;
//# sourceMappingURL=candidate-list-view.entity.d.ts.map