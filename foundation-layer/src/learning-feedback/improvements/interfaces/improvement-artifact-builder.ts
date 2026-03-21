import type { ImprovementArtifact } from "../entities/improvement-artifact.entity.js";

export interface ImprovementArtifactBuilder {
  build(input: ImprovementArtifact): ImprovementArtifact;
}
