import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type GeneratorImprovementArtifactId = Branded<string, "GeneratorImprovementArtifactId">;

export const createGeneratorImprovementArtifactId = (value: string): GeneratorImprovementArtifactId =>
  createPrefixedId(value, "lia_", "GeneratorImprovementArtifactId") as GeneratorImprovementArtifactId;
