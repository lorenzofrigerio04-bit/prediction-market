import type { Timestamp } from "../../value-objects/timestamp.vo.js";
export type AuditMetadata = Readonly<{
    createdBy: string;
    createdAt: Timestamp;
    updatedBy: string;
    updatedAt: Timestamp;
}>;
export declare const createAuditMetadata: (input: AuditMetadata) => AuditMetadata;
//# sourceMappingURL=audit-metadata.vo.d.ts.map