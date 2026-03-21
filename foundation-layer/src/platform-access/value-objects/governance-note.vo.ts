import type { Branded } from "../../common/types/branded.js";
import { createNonEmptyTrimmed } from "./platform-access-shared.vo.js";

export type GovernanceNote = Branded<string, "GovernanceNote">;

export const createGovernanceNote = (value: string): GovernanceNote =>
  createNonEmptyTrimmed(value, "INVALID_GOVERNANCE_NOTE", "governance_note") as GovernanceNote;
