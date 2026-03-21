export type ChangedFieldReference = Readonly<{
    field_path: string;
    previous_value_summary: string;
    new_value_summary: string;
}>;
export declare const createChangedFieldReference: (input: ChangedFieldReference) => ChangedFieldReference;
export declare const createChangedFieldCollection: (input: readonly ChangedFieldReference[]) => readonly ChangedFieldReference[];
//# sourceMappingURL=changed-field.vo.d.ts.map