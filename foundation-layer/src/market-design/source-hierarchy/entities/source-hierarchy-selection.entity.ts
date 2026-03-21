import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import { SourceClass } from "../../../sources/enums/source-class.enum.js";
import type { SourceHierarchySelectionId } from "../../value-objects/market-design-ids.vo.js";
import { createScore01 } from "../../value-objects/score.vo.js";
import {
  createSourcePriorityItem,
  type SourcePriorityItem,
} from "../../value-objects/source-priority.vo.js";

export type SourceHierarchySelection = Readonly<{
  id: SourceHierarchySelectionId;
  canonical_event_id: CanonicalEventIntelligenceId;
  candidate_source_classes: readonly SourceClass[];
  selected_source_priority: readonly SourcePriorityItem[];
  source_selection_reason: string;
  source_confidence: number;
}>;

export const createSourceHierarchySelection = (
  input: SourceHierarchySelection,
): SourceHierarchySelection => {
  createScore01(input.source_confidence, "source_confidence");
  if (input.candidate_source_classes.length === 0) {
    throw new ValidationError(
      "INVALID_SOURCE_HIERARCHY_SELECTION",
      "candidate_source_classes must not be empty",
    );
  }
  if (input.source_selection_reason.trim().length === 0) {
    throw new ValidationError(
      "INVALID_SOURCE_HIERARCHY_SELECTION",
      "source_selection_reason must be non-empty",
    );
  }
  const candidateSet = new Set(input.candidate_source_classes);
  const priorities = input.selected_source_priority.map(createSourcePriorityItem);
  if (priorities.length === 0) {
    throw new ValidationError(
      "INVALID_SOURCE_HIERARCHY_SELECTION",
      "selected_source_priority must not be empty",
    );
  }
  for (const item of priorities) {
    if (!candidateSet.has(item.source_class)) {
      throw new ValidationError(
        "INVALID_SOURCE_HIERARCHY_SELECTION",
        "selected_source_priority source_class must exist in candidate_source_classes",
        { source_class: item.source_class },
      );
    }
  }
  const rankSet = new Set(priorities.map((item) => item.priority_rank));
  if (rankSet.size !== priorities.length) {
    throw new ValidationError(
      "INVALID_SOURCE_HIERARCHY_SELECTION",
      "selected_source_priority priority_rank values must be unique",
    );
  }
  return deepFreeze({
    ...input,
    selected_source_priority: [...priorities],
    source_selection_reason: input.source_selection_reason.trim(),
  });
};
