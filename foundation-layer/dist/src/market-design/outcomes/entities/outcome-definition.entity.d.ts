import type { OutcomeId } from "../../../value-objects/outcome-id.vo.js";
import type { RangeDefinition } from "../../value-objects/range-definition.vo.js";
import { type OutcomeKey } from "../../value-objects/outcome-key.vo.js";
export type OutcomeDefinition = Readonly<{
    id: OutcomeId;
    outcome_key: OutcomeKey;
    display_label: string;
    semantic_definition: string;
    ordering_index_nullable: number | null;
    range_definition_nullable: RangeDefinition | null;
    active: boolean;
}>;
export declare const createOutcomeDefinition: (input: OutcomeDefinition) => OutcomeDefinition;
//# sourceMappingURL=outcome-definition.entity.d.ts.map