import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type LivePublicationContractId = Branded<string, "LivePublicationContractId">;

export const createLivePublicationContractId = (value: string): LivePublicationContractId =>
  createPrefixedId(value, "lpct_", "LivePublicationContractId") as LivePublicationContractId;
