import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type QuotaEvaluationId = Branded<string, "QuotaEvaluationId">;

export const createQuotaEvaluationId = (value: string): QuotaEvaluationId =>
  createPrefixedId(value, "vqe_", "QuotaEvaluationId");
