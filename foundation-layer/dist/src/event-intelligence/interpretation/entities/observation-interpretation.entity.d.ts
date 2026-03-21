import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { SourceObservationId } from "../../../observations/value-objects/source-observation-id.vo.js";
import type { ObservationInterpretationId } from "../../value-objects/event-intelligence-ids.vo.js";
import type { InterpretedClaim, InterpretedDate, InterpretedEntity, InterpretedNumber, InterpretationMetadata } from "../value-objects/interpreted-structures.vo.js";
export type ObservationInterpretation = Readonly<{
    id: ObservationInterpretationId;
    version: EntityVersion;
    source_observation_id: SourceObservationId;
    interpreted_entities: readonly InterpretedEntity[];
    interpreted_dates: readonly InterpretedDate[];
    interpreted_numbers: readonly InterpretedNumber[];
    interpreted_claims: readonly InterpretedClaim[];
    semantic_confidence: number;
    interpretation_metadata: InterpretationMetadata;
}>;
export declare const createObservationInterpretation: (input: ObservationInterpretation) => ObservationInterpretation;
//# sourceMappingURL=observation-interpretation.entity.d.ts.map