import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type CreditLedgerEntryId = Branded<string, "CreditLedgerEntryId">;

export const createCreditLedgerEntryId = (value: string): CreditLedgerEntryId =>
  createPrefixedId(value, "vcl_", "CreditLedgerEntryId");
