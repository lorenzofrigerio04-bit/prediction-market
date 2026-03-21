import { createAuditRecord } from "../entities/audit-record.entity.js";
export class DeterministicAuditLogger {
    records = new Map();
    log(record) {
        const validated = createAuditRecord(record);
        this.records.set(validated.id, validated);
        return validated;
    }
    getById(id) {
        return this.records.get(id) ?? null;
    }
}
//# sourceMappingURL=deterministic-audit-logger.js.map