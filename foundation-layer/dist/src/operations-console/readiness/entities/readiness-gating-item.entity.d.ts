export type ReadinessGatingItem = Readonly<{
    key: string;
    satisfied: boolean;
    reason_nullable: string | null;
}>;
export declare const createReadinessGatingItem: (input: ReadinessGatingItem) => ReadinessGatingItem;
//# sourceMappingURL=readiness-gating-item.entity.d.ts.map