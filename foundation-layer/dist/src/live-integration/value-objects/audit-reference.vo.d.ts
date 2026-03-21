import type { Branded } from "../../common/types/branded.js";
export type AuditReference = Branded<string, "LiveIntegrationAuditReference">;
export declare const createAuditReference: (value: string) => AuditReference;
export declare const assertAuditReferencePresent: (value: string) => AuditReference;
//# sourceMappingURL=audit-reference.vo.d.ts.map