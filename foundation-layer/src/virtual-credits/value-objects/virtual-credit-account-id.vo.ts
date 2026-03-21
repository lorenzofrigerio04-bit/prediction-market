import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type VirtualCreditAccountId = Branded<string, "VirtualCreditAccountId">;

export const createVirtualCreditAccountId = (value: string): VirtualCreditAccountId =>
  createPrefixedId(value, "vca_", "VirtualCreditAccountId");
