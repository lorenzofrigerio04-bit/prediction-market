import type { AuditRecord } from "../entities/audit-record.entity.js";
export interface AuditLogger {
    log(record: AuditRecord): AuditRecord;
    getById(id: string): AuditRecord | null;
}
//# sourceMappingURL=audit-logger.d.ts.map