import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { PanelKey } from "../../enums/panel-key.enum.js";
import { QueueScope } from "../../enums/queue-scope.enum.js";
import type { QueuePanelViewId } from "../../value-objects/operations-console-ids.vo.js";
import type { QueueEntryView } from "./queue-entry-view.entity.js";
import type { QueueFilter } from "./queue-filter.entity.js";
import type { QueueSortConfig } from "./queue-sort-config.entity.js";
import type { QueueSummaryCounts } from "./queue-summary-counts.entity.js";
import type { QueueVisibilityRule } from "./queue-visibility-rule.entity.js";

export type QueuePanelView = Readonly<{
  id: QueuePanelViewId;
  version: string;
  panel_key: PanelKey;
  queue_scope: QueueScope;
  entries: readonly QueueEntryView[];
  filters: readonly QueueFilter[];
  sort_config: QueueSortConfig;
  summary_counts: QueueSummaryCounts;
  visibility_rules: readonly QueueVisibilityRule[];
}>;

export const createQueuePanelView = (input: QueuePanelView): QueuePanelView => deepFreeze({ ...input });
