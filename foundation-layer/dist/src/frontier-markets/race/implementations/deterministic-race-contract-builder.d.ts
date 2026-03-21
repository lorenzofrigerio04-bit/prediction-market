import { RaceValidationStatus } from "../../enums/race-validation-status.enum.js";
import type { RaceContractBuilder, RaceContractBuilderInput } from "../interfaces/race-contract-builder.js";
export declare class DeterministicRaceContractBuilder implements RaceContractBuilder {
    build(input: RaceContractBuilderInput): Readonly<{
        id: import("../../index.js").RaceMarketDefinitionId;
        version: import("../../../index.js").EntityVersion;
        parent_canonical_event_id_nullable: import("../../../event-intelligence/index.js").CanonicalEventIntelligenceId | null;
        race_targets: readonly import("../entities/race-target.entity.js").RaceTarget[];
        winning_condition: import("../entities/race-market-definition.entity.js").RaceWinningCondition;
        deadline_resolution: import("../../../index.js").DeadlineResolution;
        source_hierarchy_selection: import("../../../index.js").SourceHierarchySelection;
        race_validation_status: RaceValidationStatus;
        metadata: import("../entities/race-market-definition.entity.js").RaceMarketDefinitionMetadata;
    }>;
}
//# sourceMappingURL=deterministic-race-contract-builder.d.ts.map