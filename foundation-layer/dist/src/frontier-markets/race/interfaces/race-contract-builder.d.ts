import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { DeadlineResolution } from "../../../market-design/deadlines/entities/deadline-resolution.entity.js";
import type { SourceHierarchySelection } from "../../../market-design/source-hierarchy/entities/source-hierarchy-selection.entity.js";
import type { RaceValidationStatus } from "../../enums/race-validation-status.enum.js";
import type { WinningConditionType } from "../../enums/winning-condition-type.enum.js";
import type { RaceMarketDefinition } from "../entities/race-market-definition.entity.js";
import type { RaceTarget } from "../entities/race-target.entity.js";
export type RaceContractBuilderInput = Readonly<{
    id: string;
    version: EntityVersion;
    parent_canonical_event_id_nullable: CanonicalEventIntelligenceId | null;
    race_targets: readonly RaceTarget[];
    winning_condition_type: WinningConditionType;
    deadline_resolution: DeadlineResolution;
    source_hierarchy_selection: SourceHierarchySelection;
    race_validation_status?: RaceValidationStatus;
    metadata?: Readonly<Record<string, string | number | boolean | null>>;
}>;
export interface RaceContractBuilder {
    build(input: RaceContractBuilderInput): RaceMarketDefinition;
}
//# sourceMappingURL=race-contract-builder.d.ts.map