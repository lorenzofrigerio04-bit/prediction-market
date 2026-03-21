import type { Branded } from "../../common/types/branded.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";

export type CanonicalContractReference = Branded<string, "CanonicalContractReference">;

export const createCanonicalContractReference = (value: string): CanonicalContractReference =>
  assertNonEmpty(value, "canonical_contract_ref") as CanonicalContractReference;
