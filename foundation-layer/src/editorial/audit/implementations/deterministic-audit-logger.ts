import type { AuditRecord } from "../entities/audit-record.entity.js";
import { createAuditRecord } from "../entities/audit-record.entity.js";
import type { AuditLogger } from "../interfaces/audit-logger.js";

export class DeterministicAuditLogger implements AuditLogger {
  private readonly records = new Map<string, AuditRecord>();

  log(record: AuditRecord): AuditRecord {
    const validated = createAuditRecord(record);
    this.records.set(validated.id, validated);
    return validated;
  }

  getById(id: string): AuditRecord | null {
    return this.records.get(id) ?? null;
  }
}
