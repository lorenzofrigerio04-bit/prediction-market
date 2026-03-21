import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import { SourceClass } from "../../../sources/enums/source-class.enum.js";
import type { SourceHierarchySelectionId } from "../../value-objects/market-design-ids.vo.js";
import { type SourcePriorityItem } from "../../value-objects/source-priority.vo.js";
export type SourceHierarchySelection = Readonly<{
    id: SourceHierarchySelectionId;
    canonical_event_id: CanonicalEventIntelligenceId;
    candidate_source_classes: readonly SourceClass[];
    selected_source_priority: readonly SourcePriorityItem[];
    source_selection_reason: string;
    source_confidence: number;
}>;
export declare const createSourceHierarchySelection: (input: SourceHierarchySelection) => SourceHierarchySelection;
//# sourceMappingURL=source-hierarchy-selection.entity.d.ts.map