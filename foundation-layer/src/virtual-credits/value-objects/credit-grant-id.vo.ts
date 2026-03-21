import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type CreditGrantId = Branded<string, "CreditGrantId">;

export const createCreditGrantId = (value: string): CreditGrantId =>
  createPrefixedId(value, "vcg_", "CreditGrantId");
