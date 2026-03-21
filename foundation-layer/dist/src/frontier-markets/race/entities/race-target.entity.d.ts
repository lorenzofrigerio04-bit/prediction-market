import { type DisplayLabel, type SemanticDefinition } from "../../value-objects/frontier-text.vo.js";
import { type RaceTargetKey } from "../../value-objects/race-target-key.vo.js";
export type RaceTarget = Readonly<{
    target_key: RaceTargetKey;
    display_label: DisplayLabel;
    semantic_definition: SemanticDefinition;
    active: boolean;
    ordering_priority_nullable: number | null;
}>;
export declare const createRaceTarget: (input: RaceTarget) => RaceTarget;
//# sourceMappingURL=race-target.entity.d.ts.map