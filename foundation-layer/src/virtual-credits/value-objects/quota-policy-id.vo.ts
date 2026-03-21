import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type QuotaPolicyId = Branded<string, "QuotaPolicyId">;

export const createQuotaPolicyId = (value: string): QuotaPolicyId =>
  createPrefixedId(value, "vqp_", "QuotaPolicyId");
