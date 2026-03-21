import type { Branded } from "../../common/types/branded.js";
export type AuditReferenceId = Branded<string, "AuditReferenceId">;
export type AuditCorrelationId = Branded<string, "AuditCorrelationId">;
export declare const createAuditReferenceId: (value: string) => AuditReferenceId;
export declare const createAuditCorrelationId: (value: string) => AuditCorrelationId;
export declare const assertAuditReferencePresent: (value: string) => AuditReferenceId;
//# sourceMappingURL=audit-reference.vo.d.ts.map