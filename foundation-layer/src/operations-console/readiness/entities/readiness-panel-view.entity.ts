import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import type { BlockingIssue } from "../../value-objects/blocking-issue.vo.js";
import type { ReadinessPanelViewId } from "../../value-objects/operations-console-ids.vo.js";
import type { WarningMessage } from "../../value-objects/warning-message.vo.js";
import type { ReadinessGatingItem } from "./readiness-gating-item.entity.js";
import type { ReadinessRecommendedAction } from "./readiness-recommended-action.entity.js";

export type ReadinessPanelView = Readonly<{
  id: ReadinessPanelViewId;
  version: string;
  target_ref: string;
  readiness_status: ReadinessStatus;
  gating_items: readonly ReadinessGatingItem[];
  blocking_issues: readonly BlockingIssue[];
  warnings: readonly WarningMessage[];
  recommended_next_actions: readonly ReadinessRecommendedAction[];
}>;

export const createReadinessPanelView = (input: ReadinessPanelView): ReadinessPanelView => deepFreeze({ ...input });
