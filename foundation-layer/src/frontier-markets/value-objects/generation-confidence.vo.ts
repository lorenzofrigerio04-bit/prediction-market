import { createScore01 } from "../../market-design/value-objects/score.vo.js";

export type GenerationConfidence = number;

export const createGenerationConfidence = (value: number): GenerationConfidence =>
  createScore01(value, "generation_confidence");
