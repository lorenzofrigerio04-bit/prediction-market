import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { DeadlineResolution } from "../../../market-design/deadlines/entities/deadline-resolution.entity.js";
import type { SourceHierarchySelection } from "../../../market-design/source-hierarchy/entities/source-hierarchy-selection.entity.js";
import { WinningConditionType } from "../../enums/winning-condition-type.enum.js";
import { RaceValidationStatus } from "../../enums/race-validation-status.enum.js";
import type { RaceMarketDefinitionId } from "../../value-objects/frontier-market-ids.vo.js";
import { createRaceTarget, type RaceTarget } from "./race-target.entity.js";

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

export const createRaceMarketDefinition = (input: RaceMarketDefinition): RaceMarketDefinition => {
  if (!Object.values(RaceValidationStatus).includes(input.race_validation_status)) {
    throw new ValidationError("INVALID_RACE_MARKET_DEFINITION", "race_validation_status is invalid");
  }
  if (!Object.values(WinningConditionType).includes(input.winning_condition.type)) {
    throw new ValidationError("INVALID_RACE_MARKET_DEFINITION", "winning_condition.type is invalid");
  }
  if (input.race_targets.length < 2) {
    throw new ValidationError("INVALID_RACE_MARKET_DEFINITION", "race_targets must have at least 2 items");
  }
  const normalizedTargets = input.race_targets.map(createRaceTarget);
  return deepFreeze({
    ...input,
    race_targets: normalizedTargets,
    metadata: { ...input.metadata },
  });
};
