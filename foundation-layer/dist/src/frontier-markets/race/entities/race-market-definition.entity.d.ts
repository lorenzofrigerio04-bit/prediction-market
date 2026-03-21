import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { DeadlineResolution } from "../../../market-design/deadlines/entities/deadline-resolution.entity.js";
import type { SourceHierarchySelection } from "../../../market-design/source-hierarchy/entities/source-hierarchy-selection.entity.js";
import { WinningConditionType } from "../../enums/winning-condition-type.enum.js";
import { RaceValidationStatus } from "../../enums/race-validation-status.enum.js";
import type { RaceMarketDefinitionId } from "../../value-objects/frontier-market-ids.vo.js";
import { type RaceTarget } from "./race-target.entity.js";
export type RaceWinningCondition = Readonly<{
    type: WinningConditionType;
    tie_break_policy: "none" | "lowest_ordering_priority";
}>;
export type RaceMarketDefinitionMetadata = Readonly<Record<string, string | number | boolean | null>>;
export type RaceMarketDefinition = Readonly<{
    id: RaceMarketDefinitionId;
    version: EntityVersion;
    parent_canonical_event_id_nullable: CanonicalEventIntelligenceId | null;
    race_targets: readonly RaceTarget[];
    winning_condition: RaceWinningCondition;
    deadline_resolution: DeadlineResolution;
    source_hierarchy_selection: SourceHierarchySelection;
    race_validation_status: RaceValidationStatus;
    metadata: RaceMarketDefinitionMetadata;
}>;
export declare const createRaceMarketDefinition: (input: RaceMarketDefinition) => RaceMarketDefinition;
//# sourceMappingURL=race-market-definition.entity.d.ts.map