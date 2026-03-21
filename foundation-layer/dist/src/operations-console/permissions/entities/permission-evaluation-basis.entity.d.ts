export type PermissionEvaluationBasis = Readonly<{
    source_module: string;
    evaluated_roles: readonly string[];
    matched_rules: readonly string[];
    deny_reasons: readonly string[];
}>;
export declare const createPermissionEvaluationBasis: (input: PermissionEvaluationBasis) => PermissionEvaluationBasis;
//# sourceMappingURL=permission-evaluation-basis.entity.d.ts.map