export type AuditFilterState = Readonly<{
    actor_refs: readonly string[];
    action_types: readonly string[];
    severity_levels: readonly string[];
}>;
export declare const createAuditFilterState: (input: AuditFilterState) => AuditFilterState;
//# sourceMappingURL=audit-filter-state.entity.d.ts.map