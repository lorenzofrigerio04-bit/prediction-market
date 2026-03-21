import type { AuditRecord } from "../entities/audit-record.entity.js";
import type { AuditLogger } from "../interfaces/audit-logger.js";
export declare class DeterministicAuditLogger implements AuditLogger {
    private readonly records;
    log(record: AuditRecord): AuditRecord;
    getById(id: string): AuditRecord | null;
}
//# sourceMappingURL=deterministic-audit-logger.d.ts.map