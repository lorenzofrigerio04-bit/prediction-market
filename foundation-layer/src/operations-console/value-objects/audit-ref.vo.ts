import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type AuditRef = Branded<string, "AuditRef">;

export const createAuditRef = (value: string): AuditRef =>
  createPrefixedId(value, "aud_", "AuditRef") as AuditRef;
