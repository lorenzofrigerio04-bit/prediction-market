import { RaceValidationStatus } from "../../enums/race-validation-status.enum.js";
import { WinningConditionType } from "../../enums/winning-condition-type.enum.js";
import { createRaceMarketDefinition } from "../entities/race-market-definition.entity.js";
import type { RaceContractBuilder, RaceContractBuilderInput } from "../interfaces/race-contract-builder.js";
import { createRaceMarketDefinitionId } from "../../value-objects/frontier-market-ids.vo.js";

export class DeterministicRaceContractBuilder implements RaceContractBuilder {
  build(input: RaceContractBuilderInput) {
    return createRaceMarketDefinition({
      id: createRaceMarketDefinitionId(input.id),
      version: input.version,
      parent_canonical_event_id_nullable: input.parent_canonical_event_id_nullable,
      race_targets: input.race_targets,
      winning_condition: {
        type: input.winning_condition_type ?? WinningConditionType.FIRST_TO_OCCUR,
        tie_break_policy: "lowest_ordering_priority",
      },
      deadline_resolution: input.deadline_resolution,
      source_hierarchy_selection: input.source_hierarchy_selection,
      race_validation_status: input.race_validation_status ?? RaceValidationStatus.REVIEW_REQUIRED,
      metadata: input.metadata ?? {},
    });
  }
}
