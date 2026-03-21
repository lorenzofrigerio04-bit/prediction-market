import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type CreditBalanceSnapshotId = Branded<string, "CreditBalanceSnapshotId">;

export const createCreditBalanceSnapshotId = (value: string): CreditBalanceSnapshotId =>
  createPrefixedId(value, "vcs_", "CreditBalanceSnapshotId");
