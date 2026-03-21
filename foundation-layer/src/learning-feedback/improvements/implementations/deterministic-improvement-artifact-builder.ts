import { createImprovementArtifact, type ImprovementArtifact } from "../entities/improvement-artifact.entity.js";
import type { ImprovementArtifactBuilder } from "../interfaces/improvement-artifact-builder.js";

export class DeterministicImprovementArtifactBuilder implements ImprovementArtifactBuilder {
  build(input: ImprovementArtifact): ImprovementArtifact {
    return createImprovementArtifact(input);
  }
}
