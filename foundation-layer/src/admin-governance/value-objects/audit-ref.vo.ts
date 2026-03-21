import type { Branded } from "../../common/types/branded.js";
import { createNonEmpty } from "./shared.vo.js";

export type AuditRef = Branded<string, "AuditRef">;

export const createAuditRef = (value: string): AuditRef =>
  createNonEmpty(value, "audit_ref") as AuditRef;
