import type { SourceObservation } from "../../../observations/entities/source-observation.entity.js";
import type { ObservationInterpretation } from "../entities/observation-interpretation.entity.js";

export interface ObservationInterpreter {
  interpret(observation: SourceObservation): ObservationInterpretation;
}
