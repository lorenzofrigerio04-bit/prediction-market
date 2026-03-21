import type { CorrelationGroupRef } from "../../value-objects/correlation-group-ref.vo.js";
export type AuditCorrelationGroup = Readonly<{
    group_ref: CorrelationGroupRef;
    item_refs: readonly string[];
}>;
export declare const createAuditCorrelationGroup: (input: AuditCorrelationGroup) => AuditCorrelationGroup;
//# sourceMappingURL=audit-correlation-group.entity.d.ts.map