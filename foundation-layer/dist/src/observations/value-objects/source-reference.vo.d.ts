import { SourceReferenceKind } from "../enums/source-reference-kind.enum.js";
export type SourceReference = Readonly<{
    kind: SourceReferenceKind;
    reference: string;
    locator: string | null;
}>;
export declare const createSourceReference: (input: SourceReference) => SourceReference;
//# sourceMappingURL=source-reference.vo.d.ts.map